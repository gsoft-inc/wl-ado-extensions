import * as tl from "azure-pipelines-task-lib/task";

// Based on https://github.com/joachimdalen/azdevops-pull-request-utils/blob/master/shared/pull-request-core/src/variable-resolver.ts
export class AzureDevOpsHelper {
    private static readonly regexp = /\$\(\s?([^)]+?)\s?\)/g;

    static resolveVariables(origValue: string): string {
        let newValue = origValue;

        let match: RegExpExecArray | null;
        while ((match = this.regexp.exec(newValue)) !== null) {
            const value = tl.getVariable(match[1]);
            if (value && value !== "") {
                newValue = this.replaceAll(newValue, match[0], value);
                this.regexp.lastIndex = 0;
            } else {
                console.log("Variable '" + match[1] + "' not defined.");
            }
        }

        return newValue;
    }

    private static escapeRegExp(reg: string): string {
        return reg.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    }

    private static replaceAll(value: string, searchValue: string, replaceValue: string) {
        return value.replace(new RegExp(this.escapeRegExp(searchValue), "g"), replaceValue);
    }
}
