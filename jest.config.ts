import type { Config } from "jest";

const config: Config = {
    projects: [
        "<rootDir>/extensions/*"
    ],
    testRegex: "/tests/*/.*\\.test\\.ts$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    cacheDirectory: "./node_modules/.cache/jest",
    clearMocks: true,
    verbose: true
};

export default config;
