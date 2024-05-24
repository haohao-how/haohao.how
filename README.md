# haohao.how

[![CI](https://github.com/bradleyayers/haohaohow/actions/workflows/ci.yml/badge.svg)](https://github.com/bradleyayers/haohaohow/actions/workflows/ci.yml)

## Setup

Install [proto](https://moonrepo.dev/proto):

```sh
curl -fsSL https://moonrepo.dev/install/proto.sh | bash
```

Install other tools used in the workspace:

```sh
proto use
```

## Running scripts with moon

```sh
moon frontend:dev
```

# Cookbook

## Upgrading Yarn

Inside `toolchain.yml` edit `node.yarn.version` and update the version. Run
`moon sync projects` to apply the change.

## Upgrading Moon

```
proto outdated --update
proto use
```

## Upgrading Proto

```
proto upgrade
```

## Upgrading Node.js

Edit `.moon/toolchain.yml` edit `node.version`.

```
moon run node-version
```

Moon will automatically synchronize `package.json` `engines.node`, and it will
use proto to download and install the right version of Node.js.

## Upgrading a transitive Yarn dependency (e.g. for security patch)

A normal `yarn up ___` won't work if no workspace depends on it directly, so you
need to use `--recursive`. For example to upgrade `tar` use:

```
yarn up -R tar
```

## Writing Pinyin on macOS

1. Enable the `Pinyin - Simplified` keyboard.
1. Type the pinyin without the tone (e.g. `hao`).
1. Press <kbd>Tab</kbd> to cycle through each tone.
1. Press <kbd>Enter</kbd> to accept the pinyin.

Example: to write `hǎo` type <kbd>h</kbd> <kbd>a</kbd> <kbd>o</kbd> <kbd>Tab</kbd> <kbd>Tab</kbd> <kbd>Tab</kbd> <kbd>Enter</kbd>.
