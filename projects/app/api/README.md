This works around https://github.com/expo/expo/issues/29431 as well as ensuring
`@expo/server` is installed in the deployment because it's not bundled as part
of `expo export`.

This is using `pnpm` because Vercel only supports Yarn 1 which doesn't support
patching dependencies. The `pnpm-workspace.yaml` file avoids `pnpm` getting
confused by being in a Yarn workspace.
