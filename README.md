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
