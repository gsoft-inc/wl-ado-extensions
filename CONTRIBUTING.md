# Contributing

The following documentation is only for the maintainers of this repository.

- [Monorepo setup](#monorepo-setup)
- [Project overview](#project-overview)
- [Installation](#installation)
- [Develop the CLI packages](#Develop-the-CLI-packages)
- [Release the packages](#release-the-packages)
- [Available commands](#commands)
- [CI](#ci)
- [Add a new package to the monorepo](#add-a-new-package-to-the-monorepo)

## Monorepo setup

This repository is managed as a monorepo with [PNPM workspace](https://pnpm.io/workspaces) to handle the installation of the npm dependencies and manage the packages interdependencies.

It's important to note that PNPM workspace doesn't hoist the npm dependencies at the root of the workspace as most package manager does. Instead, it uses an advanced [symlinked node_modules structure](https://pnpm.io/symlinked-node-modules-structure). This means that you'll find a `node_modules` directory inside the packages folders as well as at the root of the repository.

The main difference to account for is that the `devDependencies` must now be installed locally in every package `package.json` file rather than in the root `package.json` file.

## Project overview

This project is mainly Azure DevOps extensions, all into [extensions/](extensions/).

### Extensions

Under [extensions/](extensions/) you'll find all the extensions that are published to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/azuredevops).

[PR Messenger](extensions/pr-messenger/) is a [Azure DevOps extension](https://marketplace.visualstudio.com/azuredevops) that allows you to send a message to a pull request as a build step.

## Installation

This project uses PNPM, therefore, you must [install PNPM](https://pnpm.io/installation):

To install the project, open a terminal at the root of the workspace and execute the following command:

```bash
pnpm install
```

## Develop the CLI packages

The following documentation is a brief overview of the tools and processes involved in the development of the Azure DevOps extensions.

> To develop for each extension, you can either run `pnpm dev` from the project root folder. This will build all the content of the `extensions` folder.
>
> You can also individually run the command `pnpm dev` from a extension folder (example `extensions/pr-messenger/`).

### Working in `PR Messenger`

See the [PR Messenger documentation](extensions/pr-messenger/README.md) or by running the `dist/index.js` file using `node` and passing it parameters.

### Linting

To lint the packages, call `pnpm lint` from the project root folder.

### Testing

To run the automated tests, call `pnpm test`. The tests are run using [Jest](https://jestjs.io/) and the result will be displayed on the terminal.

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

### release

Prepare the package for publishing.

````bash
pnpm release
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

## Publishing

> To publish to an other publisher, you will need first to change the publisher in the `vss-extension.json` file at the root of this project.

To publish a new version of the extension:

1. Run the `pnpm publish` command from the extension folder.
2. Then follow the steps from [Microsoft documentation](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops#4-package-your-extension).
