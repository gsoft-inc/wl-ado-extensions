import {
    TaskResult,
    getEndpointAuthorizationParameter,
    getVariable,
    setResult,
    debug
} from "azure-pipelines-task-lib/task";
import {
    type Comment,
    CommentThreadStatus,
    CommentType,
    type GitPullRequestCommentThread
} from "azure-devops-node-api/interfaces/GitInterfaces";
import { EOL } from "node:os";
import type { IGitApi } from "azure-devops-node-api/GitApi";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";

interface ExistingComment {
    thread: GitPullRequestCommentThread;
    comment: Comment;
}

export interface CommentHelperOptions {
    pullRequestId: number;
    refreshMessagePosition?: boolean;
}

export class CommentHelper {
    static readonly COMMENT_ID = "pr-messenger";
    static readonly DEFAULT_THREAD_STATUS = CommentThreadStatus.Unknown;

    private readonly pullRequestId: number;
    private readonly refreshMessagePosition: boolean;
    private readonly connection: WebApi;
    private readonly repositoryId: string | undefined;

    private gitApi: IGitApi | undefined;

    constructor(options: CommentHelperOptions) {
        this.pullRequestId = options.pullRequestId;
        this.refreshMessagePosition = options.refreshMessagePosition ?? false;

        const accessToken = getEndpointAuthorizationParameter("SystemVssConnection", "AccessToken", false);
        const authHandler = getPersonalAccessTokenHandler(accessToken!);
        const collectionUri = getVariable("System.CollectionUri");
        this.repositoryId = getVariable("Build.Repository.ID");
        this.connection = new WebApi(collectionUri!, authHandler);
    }

    async sendComment(message: string) {
        this.gitApi = await this.connection.getGitApi();

        if (!this.gitApi) {
            return;
        }

        const currentThreads = await this.gitApi.getThreads(this.repositoryId!, this.pullRequestId);
        const existingComment = this.getExistingComment(currentThreads);

        if (existingComment) {
            if (this.refreshMessagePosition) {
                await this.deleteComment(existingComment);
                await this.createComment(message);
            } else {
                await this.replaceComment(existingComment, message);
            }
        } else {
            await this.createComment(message);
        }
    }

    private isContainingIdentifier(comment: string) {
        const matchRegex = new RegExp(`^\\[\\/\\/\\]: # \\(${CommentHelper.COMMENT_ID}\\)$`, "m");

        return matchRegex.test(comment);
    }

    private appendIdentifier(message: string) {
        return message + EOL + EOL + `[//]: # (${CommentHelper.COMMENT_ID})`;
    }

    private createCommentPayload(comment: string): Comment {
        return {
            content: comment,
            commentType: CommentType.Text
        };
    }

    private parseStatus(status: unknown): CommentThreadStatus {
        let parsedStatus = CommentThreadStatus[status as keyof typeof CommentThreadStatus];
        if (parsedStatus === undefined) {
            parsedStatus = CommentHelper.DEFAULT_THREAD_STATUS;
        }

        return parsedStatus;
    }

    private createPayload(comment: string): GitPullRequestCommentThread {
        const commentObject: Comment = this.createCommentPayload(comment);

        return {
            comments: [commentObject],
            status: CommentHelper.DEFAULT_THREAD_STATUS
        };
    }

    private getExistingComment(currentThreads: GitPullRequestCommentThread[]): ExistingComment | undefined {
        for (const currentThread of currentThreads) {
            if (currentThread.comments !== null && currentThread.comments !== undefined) {
                for (const threadComment of currentThread.comments) {
                    if (this.isContainingIdentifier(threadComment.content!)) {
                        return {
                            thread: currentThread,
                            comment: threadComment
                        };
                    }
                }
            }
        }

        return undefined;
    }

    private async replaceComment(existingComment: ExistingComment, message: string) {
        const commentWithIdentifier = this.appendIdentifier(message);
        const comment = this.createCommentPayload(commentWithIdentifier);
        const updatedComment = await this.gitApi?.updateComment(
            comment,
            this.repositoryId!,
            this.pullRequestId,
            existingComment.thread.id!,
            existingComment.comment.id!
        );

        const existingStatus = this.parseStatus(existingComment.thread.status?.toString());

        debug(existingStatus.toString());

        if (CommentHelper.DEFAULT_THREAD_STATUS !== existingStatus) {
            await this.gitApi?.updateThread(
                {
                    status: CommentHelper.DEFAULT_THREAD_STATUS
                },
                this.repositoryId!,
                this.pullRequestId,
                existingComment.thread.id!
            );

            debug(`Updated thread ${existingComment.thread.id} from status ${existingStatus} to ${CommentHelper.DEFAULT_THREAD_STATUS}`);
        }

        setResult(TaskResult.Succeeded, `Updated pull request comment with id: ${updatedComment?.id} on thread with id: ${existingComment.thread.id} on PR with id: ${this.pullRequestId}`);
    }

    private async createComment(message: string) {
        const commentWithIdentifier = this.appendIdentifier(message);
        const thread = this.createPayload(commentWithIdentifier);

        const createdThread = await this.gitApi?.createThread(thread, this.repositoryId!, this.pullRequestId);

        setResult(TaskResult.Succeeded, `Posted pull request thread with id: ${createdThread?.id} on PR with id: ${this.pullRequestId}`);
    }

    private async deleteComment(existingComment: ExistingComment) {
        await this.gitApi?.deleteComment(this.repositoryId!, this.pullRequestId, existingComment.thread.id!, existingComment.comment.id!);

        debug(`Deleted comment with id: ${existingComment.comment.id} on thread with id: ${existingComment.thread.id} on PR with id: ${this.pullRequestId}`);
    }
}
