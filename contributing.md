# Contributing

First off, thanks for taking the time to contribute!

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or come join our [Discord](https://discord.gg/fpW5cWemXH).

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Releasing packages](#releasing-packages)

## Code of Conduct

This project and everyone participating in it is governed by the
[contributing.md Code of Conduct](code_of_conduct.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior
to <coc@stanza.systems>.

## Reporting Bugs

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to <support@stanza.systems>.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](/issues/new).
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the _reproduction steps_ that someone else can follow to recreate the issue on their own. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be implemented by someone.

### Releasing Packages

Right now the process of publishing packages is manual. To release the packages please follow the steps listed below:

- bump versions in all `package.json` files under `packages/*`
- bump all dependencies pointing to `@getstanza/*` packages to the new version 
- create a release branch `release/<X.Y.Z>` where `<X.Y.Z>` is the new version that you want to release and create a PR
- merge the PR to main 
- create and push a tag for the release on the `main` branch 
  - `git tag v<X.Y.Z>` where `<X.Y.Z>` is the new version that you want to release
  - `git push origin v<X.Y.Z>`
- build all the packages: `npx nx run-many --target=build --all`
- cd into each package dist directory and publish a new version of the package e.g.
```shell
cd dist/packages/core
npm publish --access public --tag latest
```

**! You don't need to release `dist/packages/mocks/*` !**
