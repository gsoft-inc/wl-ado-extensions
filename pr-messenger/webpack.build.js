import path from "node:path";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

/** @type {import("webpack").Configuration} */
export default {
    mode: "production",
    target: "node",
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: path.resolve("src"),
                use: "swc-loader"
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
                { from: "./icon.png", to: "icon.png" },
                { from: "./task.json", to: "task.json" }
            ]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            // Allow us to use SWC for package optimization, which is way faster than the default minimizer
            new TerserPlugin({
                minify: TerserPlugin.swcMinify,
                // `terserOptions` options will be passed to `swc` (`@swc/core`)
                // Link to options - https://swc.rs/docs/config-js-minify
                terserOptions: {
                    compress: true,
                    mangle: true
                }
            })
        ]
    }
};
