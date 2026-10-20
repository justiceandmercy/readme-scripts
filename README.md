# readme-scripts

A small, dependency-free CLI that audits a project's `README.md` against the `scripts` in `package.json`. It reports scripts that are never mentioned in the README and README commands that point to scripts that no longer exist.

## Features

- Detects undocumented scripts in `package.json`
- Detects stale references such as `npm run removed-script`
- Supports `npm`, `yarn`, `pnpm`, and `bun` command forms
- Prints human-readable or JSON output
- Returns a non-zero exit code in strict mode for CI usage
- Has no runtime dependencies

## Install

Run directly with Node.js 18 or newer:

```sh
node src/cli.js
```

Or install it as a local development tool:

```sh
npm install --save-dev readme-scripts
npx readme-scripts
```

## Usage

Run in a project directory containing `package.json` and `README.md`:

```sh
node src/cli.js
```

Useful options:

```sh
node src/cli.js --readme docs/README.md
node src/cli.js --package packages/app/package.json
node src/cli.js --json
node src/cli.js --strict
```

Example output:

```text
README scripts audit

Package: /project/package.json
README:  /project/README.md

Scripts:       4
Documented:    2
Undocumented:  2
Stale refs:    1

Undocumented scripts:
  - lint
  - typecheck

Stale references:
  - README.md:12: npm run deploy
```

In strict mode, the process exits with status `1` when undocumented scripts or stale references are found:

```sh
node src/cli.js --strict
```

## How it works

`readme-scripts` reads the `scripts` object from `package.json`, scans each line of the README, and recognizes common package-manager command forms. A script is considered documented when its name appears in a recognized command. Explicit commands such as `npm run deploy` are checked against the script list; unknown names are reported as stale references.

## Limitations

- The scanner is line-based and intentionally simple.
- It does not execute scripts or inspect shell scripts outside the README.
- Shorthand commands such as `yarn build` are only counted when the name is an existing script, which avoids false positives for commands such as `yarn add`.

## License

MIT
