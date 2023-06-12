import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { exec } from "child_process";

const published = process.argv.indexOf("--published") > -1 ? process.argv[process.argv.indexOf("--published") + 1] : false;

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootPath = join(__dirname, '..', '..');

async function updateVersion(extension) {
    const extensionPath = join(rootPath, 'extensions', extension.name);

    const vssExtManifestPath = join(extensionPath, "vss-extension.json");
    const vssExtManifest = JSON.parse(await readFile(vssExtManifestPath, "utf8"));

    const taskManifestPath = join(extensionPath, "task.json");
    const taskManifest = JSON.parse(await readFile(taskManifestPath, "utf8"));

    vssExtManifest.version = extension.version;

    taskManifest.version.Major = parseInt(extension.version.split(".")[0]);
    taskManifest.version.Minor = parseInt(extension.version.split(".")[1]);
    taskManifest.version.Patch = parseInt(extension.version.split(".")[2]);

    await writeFile(vssExtManifestPath, JSON.stringify(vssExtManifest, null, 4), "utf8");
    await writeFile(taskManifestPath, JSON.stringify(taskManifest, null, 4), "utf8");
    console.log(`Updated version for ${extension.name} to ${extension.version}`);
}

async function prepareExtension(extension) {
    const extensionPath = join(rootPath, 'extensions', extension.name);

    const runPrepareScript = exec(`pnpm build && pnpm run publish`, {cwd: extensionPath});

    await new Promise(resolve => {
        runPrepareScript.on("error", error => {
            console.error(error);
            resolve(1);
        });
        runPrepareScript.stderr?.on("data", (x) => {
            console.log(x);
            resolve(1);
        });
        runPrepareScript.stdout?.on("data", (x) => {
            console.log(x);
        });
        runPrepareScript.on("exit", code => {
            resolve(code ?? 0);
        });
    });

    console.log(`Prepared ${extension.name}`);
}

async function publishExtension(extension) {
    const extensionPath = join(rootPath, 'extensions', extension.name);

    const runPublishScript = exec(`tfx publish`, {cwd: extensionPath});

    await new Promise(resolve => {
        runPublishScript.on("error", error => {
            console.error(error);
            resolve(1);
        });
        runPublishScript.stderr?.on("data", (x) => {
            console.log(x);
            resolve(1);
        });
        runPublishScript.stdout?.on("data", (x) => {
            console.log(x);
        });
        runPublishScript.on("exit", code => {
            resolve(code ?? 0);
        });
    });

    console.log(`Published ${extension.name}`);
}

if (published) {
    const publishedParsed = JSON.parse(published);

    for (let extension of publishedParsed) {
        await updateVersion(extension);
        await prepareExtension(extension);
    }
}
