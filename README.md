# @threadbase/core

Internal shared TypeScript library for the [Threadbase](https://threadbase.sh/) project. Provides multi-assistant provider abstractions and typed tool results consumed by the Threadbase clients (mobile, electron, vscode, intellij) and the `@threadbase/ui` rendering library.

Published here for transparency. Not intended as a standalone library — the API surface targets the needs of the Threadbase clients and may change without notice.

## Install

```sh
npm install git+https://github.com/RonenMars/threadbase-core.git
```

## Related

- [`threadbase-mobile`](https://github.com/RonenMars/threadbase-mobile) — iOS + Android client
- [`threadbase-ui`](https://github.com/RonenMars/threadbase-ui) — Shared React components (depends on this package)
- [`threadbase-electron`](https://github.com/RonenMars/threadbase-electron) — Desktop client
- [`threadbase-vscode`](https://github.com/RonenMars/threadbase-vscode) — VS Code extension
- [`threadbase-intellij`](https://github.com/RonenMars/threadbase-intellij) — JetBrains plugin

## License

[MIT](LICENSE)
