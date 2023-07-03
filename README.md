# Stanza JS

This is the monorepo containing all Stanza JavaScript packages and samples.

## Documentation

Refer to the `README.md` file linked to each sample, and the [Stanza Docs](https://stanza-docs-git-main-stanza.vercel.app/).

## Sample Applications

- [`samples/express-demo`](./samples/express-demo/README.md) - Express (Node) sample, showing Stanza decorators.  (Good first sample to start with.)
- [`samples/next-with-stripe`](./samples/next-with-stripe/README.md) - Next.js sample that uses the Stripe React component.
- [`samples/react-simple`](./samples/react-simple/README.md) - Simple React sample app
- [`samples/simple-next`](./samples/simple-next/README.md) - Simple Next.js sample app

The following samples are used primarily during Stanza development, and are works in progress:

- `samples/browser-simple` - Browser sample app using a mocked hub
- `samples/hub-mock-api` - Express sample app using a mocked hub

## Stanza Packages

### Main Packages

- `packages/core` - Stanza JS core library, used by browser, node, and other packages
- `packages/browser` - Stanza browser SDK
- `packages/node` - Stanza Node SDK

### Supporting Packages

- `packages/next` - Stanza components for Next.js
- `packages/next-node` - Stanza Node SDK adapter for Next.js
- `packages/stanza-react` - Stanza React components
- `packages/mocks` - Stanza mocks for use in development and testing

## Toolchain

Stanza JS uses the following tools, which you should familiarize yourself with:
- [Nx](https://nx.dev/)
- [esbuild](https://esbuild.github.io/)
- [ESLint](https://eslint.org/)
- [TypeScript](https://www.typescriptlang.org/)

Throughout this document, we'll assume that Nx is _not_ installed globally and use `npx nx`.
If you prefer to [install Nx globally](https://nx.dev/getting-started/installation#installing-nx-globally),
you can use `nx` instead of `npx nx` anywhere that it is mentioned.

## Getting started

Install all dependencies for the monorepo:

```sh
npm install
```

_If you get deprecation or vulnerability warnings, they are likely from our development dependencies only, and unrelated to Stanza packages.
To be certain, you can run `npm audit --omit=dev` which should find 0 vulnerabilities.  If this is not the case, please
[open an issue](https://github.com/StanzaSystems/stanza-js/issues)._

After everything is installed, you can build all of the packages and sample applications:

```sh
npx nx run-many --target build
```

If you prefer, you can build a single sample application, including its dependent packages. For example:

_From the repository root:_

```sh
npx nx build express-demo
```

_Or, from a specific directory:_

```sh
cd samples/express-demo
npx nx build
```

## Running a sample

Running a sample application is similar to building, but uses the `serve` target:

_From the repository root:_

```sh
npx nx serve express-demo
```

_Or, from a specific directory:_

```sh
cd samples/express-demo
npx nx serve
```

By default, these samples will run in development mode.  Saving a file will restart the application.

## Workspaces and packages

To add a new package:

```shell
npx nx generate @nx/js:library {your package name} --publishable --importPath @getstanza/{your package name}
```

To add a sample app, you can use one of the available [Nx packages](https://nx.dev/packages) as a starter template.

Some examples:

```shell
npx nx generate @nx/next:app {your app name}
npx nx generate @nx/web:app {your app name}
npx nx generate @nx/react:app {your app name}
```

Because we manage the repository as a monorepo with Nx, all dependencies should be installed from the root directory.

## Support

Stanza supports only evergreen browsers, and Node releases [in current, active, or maintenance phases](https://github.com/nodejs/release#release-schedule).
