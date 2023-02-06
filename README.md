# Stanza JS

This is the monorepo containing all Stanza JavaScript packages. A brief overview:

- `packages/core` contains the core types and constructs Stanza uses in JS
- `packages/browser` contains browser-based primitives for using Stanza features
- `packages/react` contains Stanza react components

## Getting started
```
npm install
npm run build
```

## Toolchain
Stanza uses Vite to build, eslint, and typescript.

## Workspaces and packages
Add new workspaces using 
```
npm init -w ./packages/{your package name} //packages
npm init -w ./samples/{your sample name} //samples
```

as far as I can tell, the best way to install dependencies is from the root of the project, with workspace specificed. For example
```
npm install react -w packages/stanza-react
```
will install react into just the stanza-react package

## Support
Stanza supports evergreen browsers, and Node releases [in current, active or maintenance state](https://github.com/nodejs/release#release-schedule)