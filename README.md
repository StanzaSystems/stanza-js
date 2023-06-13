# Stanza JS

This is the monorepo containing all Stanza JavaScript packages. A brief overview:

- `packages/core` contains the core types and constructs Stanza uses in JS
- `packages/browser` contains browser-based primitives for using Stanza features
- `packages/stanza-react` contains Stanza react components
- `packages/next` contains Stanza NextJS components
- `packages/node` contains Stanza Node SDK
- `packages/next-node` contains Stanza Node SDK adapter for NextJS

## Getting started
```
npm install
npx nx run-many --target build
```

## Toolchain
Stanza uses Nx manage a workspace, esbuild to build, eslint, and typescript.

## Running a sample

To run one of the sample apps you can use Nx command

```shell
# npx nx serve {name of the app}
# eg
npx nx serve next-with-stripe
```

## Workspaces and packages
Add new package using
```shell
npx nx generate @nx/js:library {your package name} --publishable --importPath @getstanza/{your package name}
```

To add a sample app you can use one of the available Nx [packages](https://nx.dev/packages) to generate an app

examples:

```shell
npx nx generate @nx/next:app {your app name}
npx nx generate @nx/web:app {your app name}
npx nx generate @nx/react:app {your app name}
```


Because we manage the repository as a monorepo with NX all dependencies should be installed in the root of the project

## Support
Stanza supports evergreen browsers, and Node releases [in current, active or maintenance context](https://github.com/nodejs/release#release-schedule)
