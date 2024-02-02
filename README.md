# haohao.how

[![CI](https://github.com/bradleyayers/haohaohow/actions/workflows/ci.yml/badge.svg)](https://github.com/bradleyayers/haohaohow/actions/workflows/ci.yml)

# Setup

- Install `proto`

```sh
$ curl -fsSL https://moonrepo.dev/install/proto.sh | bash
```

- Install `node`

```sh
$ proto install node 21
```

- Install `moon`

```sh
$ proto tool add moon "source:https://raw.githubusercontent.com/moonrepo/moon/master/proto-plugin.toml"
$ proto install moon
```

# Running scripts with moon

```sh
$ moon frontend:build
```
