import { TaskResult, getInput, getBoolInput, getVariable, setResult } from "azure-pipelines-task-lib/task";
import { CommentHelper } from "./commentHelper";
import { AzureDevOpsHelper } from "./azdoHelper";

type BuildStatus = "Succeeded" | "Failed" | "SucceededWithIssues" | "Canceled" | undefined;
type BuildReason =
  | "Manual"
  | "IndividualCI"
  | "BatchedCI"
  | "Schedule"
  | "ValidateShelveset"
  | "CheckInShelveset"
  | "PullRequest"
  | "BuildCompletion"
  | "ResourceTrigger"
  | undefined;

async function run() {
    try {
        // Get inputs
        const message: string | undefined = getInput("message", false);
        const messageSuccess: string | undefined = getInput("messageSuccess", false);
        const messageFailure: string | undefined = getInput("messageFailure", false);
        const refreshMessagePosition: boolean | undefined = getBoolInput("refreshMessagePosition", false);

        // Get build variables
        const buildStatus: BuildStatus = getVariable("Agent.JobStatus") as BuildStatus;
        const buildReason: BuildReason = getVariable("Build.Reason") as BuildReason;
        const pullRequestId = getVariable("System.PullRequest.PullRequestId");

        // Check if build was caused by a pull-request
        if (buildReason !== "PullRequest" || !pullRequestId) {
            setResult(TaskResult.SucceededWithIssues, " ⚠️ Could not post comment. Pipeline was not caused by a pull-request.");

            return false;
        }

        const commentHelper = new CommentHelper({
            pullRequestId: Number(pullRequestId),
            refreshMessagePosition: refreshMessagePosition
        });

        if (messageSuccess && buildStatus === "Succeeded") {
            await commentHelper.sendComment(AzureDevOpsHelper.resolveVariables(messageSuccess));

            return;
        } else if (messageFailure && buildStatus === "Failed") {
            await commentHelper.sendComment(AzureDevOpsHelper.resolveVariables(messageFailure));

            return;
        } else if (message) {
            await commentHelper.sendComment(AzureDevOpsHelper.resolveVariables(message));

            return;
        }

        setResult(TaskResult.Succeeded, "Not commented on pull request");
    } catch (err: unknown) {
        setResult(TaskResult.Failed, (err as Error).message);
    }
}

run();
