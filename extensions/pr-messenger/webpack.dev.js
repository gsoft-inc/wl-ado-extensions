import path from "node:path";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "node:url";

/** @type {import("webpack").Configuration} */
export default {
    mode: "development",
    target: "node",
    entry: "./src/index.ts",
    stats: "minimal",
    devtool: "eval-cheap-module-source-map",
    output: {
        filename: "index.js",
        clean: true
    },
    cache: {
        type: "filesystem",
        allowCollectingMemory: true,
        buildDependencies: {
            config: [fileURLToPath(import.meta.url)]
        },
        cacheDirectory: path.resolve("node_modules/.cache/webpack")
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: path.resolve("src"),
                use: {
                    loader: "swc-loader",
                    options: {
                        sourceMaps: true,
                        inlineSourcesContent: true
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            "azure-devops-extension-api": path.resolve("node_modules/azure-devops-extension-api"),
            "azure-pipelines-task-lib": path.resolve("node_modules/azure-pipelines-task-lib")
        },
        extensions: [".ts", ".js"]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./extension-icon.png", to: "extension-icon.png" },
                { from: "./task.json", to: "task.json" }
            ]
        })
    ]
};
