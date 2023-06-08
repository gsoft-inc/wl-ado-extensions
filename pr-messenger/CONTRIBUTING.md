# Contributing

To contribute to the project, you can follow the steps below.

## Prerequisites

1. Node.js 16.x and newer
2. PNPM 8.x and newer

## Installation

This project uses PNPM, therefore, you must [install PNPM](https://pnpm.io/installation):

To install the project, open a terminal at the root of the workspace and execute the following command:

```bash
pnpm install
```

## Commands

### dev

Build the development version of the extension.

````bash
pnpm dev
````

### build

Build the production optimized version of the extension.

````bash
pnpm build
````

### lint

Run linting on the files.

````bash
pnpm lint
````

### clean

Delete all build results and cache.

````bash
pnpm clean
````

### reset

Delete all build results and `pnpm` installed packages in this project.

````bash
pnpm reset
````

### analyze

Analyze the bundle size of the extension.

````bash
pnpm analyze
````

## Publishing

> To publish to an other publisher, you will need first to change the publisher in the `vss-extension.json` file at the root of this project.

To publish a new version of the extension:

1. Build the project with the `pnpm build` command.
2. Then follow the steps from [Microsoft documentation](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops#4-package-your-extension).
