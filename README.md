# Conflux DevKit Template

## Overview

This project is Hardhat's viem sample project enhanced with Hardhat Ignition.

## Deploying

To run the Ignition deploy against the ephemeral hardhat network:

```shell
npx hardhat ignition deploy ./ignition/modules/LockModule.js
```

## Test

To run the hardhat tests using Ignition:

```shell
npm run test
```

This repository serves as a template for the Conflux DevKit. Before using it, make sure to customize the following files:

- **README.md** (this file)

- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**:

  - Change the email in the `Enforcement` section (placeholder: `YOUR@EMAIL.HERE`).

- **[CONTRIBUTING.md](CONTRIBUTING.md)**:

  - Change the GitHub user in the `Solve an issue` section (placeholder: `GITHUBUSER`).

- **[pull_request_template.md](.github/pull_request_template.md)**:

  - Change the GitHub user in the `Additional Information` section (placeholder: `GITHUBUSER`).

- **[config.yml](.github/ISSUE_TEMPLATE/config.yml)**:

  - Change the GitHub user in the URLs (placeholder: `GITHUBUSER`).

- **[LICENSE](LICENSE)**:
  - Change the GitHub user (placeholder: `GITHUBUSER`).

Additionally, customize the repository as needed, including the **[.gitignore](.gitignore)** and other relevant files.
