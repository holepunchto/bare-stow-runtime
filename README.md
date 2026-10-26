# bare-stow-runtime

Bundle side of the `bare-stow` (<https://github.com/holepunchto/bare-stow>) lifecycle. Runs the entry of a stowed bundle and reports its readiness, faults, and exit to the host over `bare-stow-protocol` (<https://github.com/holepunchto/bare-stow-protocol>). The entry shim that `bare-stow` packs into every bundle imports it, so the package containing the bundle entry must depend on it.

```
npm i bare-stow-runtime
```

## Usage

```js
const runtime = require('bare-stow-runtime')

const ipc = runtime.attach(Bare.IPC)

ipc.run(() => import('./core.js'), ipc)
```

A bundle that owns its process, such as a sidecar, attaches through `bare-stow-runtime/process` instead, which also shuts down on `SIGTERM`. Signals are delivered to the whole process, so a bundle running in a thread, such as a worker or worklet, leaves them to the host, and doesn't load `bare-signals` at all:

```js
const runtime = require('bare-stow-runtime/process')
```

## Shutdown

The worker shuts down when the host sends `terminate`, when the host goes away, when Bare is about to exit, on `SIGTERM` when attached through `bare-stow-runtime/process`, and on an uncaught exception or unhandled rejection. Shutting down runs `stop()`, reports any error followed by the exit code to the host if it is still there, and exits. If that takes longer than the `grace` configured by the host, 5 seconds by default, the worker exits regardless.

## License

Apache-2.0
