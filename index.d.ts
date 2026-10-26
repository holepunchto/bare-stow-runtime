import { Duplex } from 'bare-stream'
import { Protocol } from 'bare-stow-protocol'

/**
 * The worker side of a stowed bundle's lifecycle, layered on a `Protocol`. The worker shuts down
 * when the host sends `terminate`, when the host goes away, when Bare is about to exit, and on an uncaught
 * exception or unhandled rejection. Shutting down runs `stop()`, reports any error followed by the
 * exit code to the host if it is still there, and exits. If that takes longer than the `grace`
 * configured by the host, 5 seconds by default, the worker exits regardless.
 */
interface Runtime extends Protocol {
  /**
   * Load the bundle entry with `load()` and call its default export with `arg` and a `ready`
   * callback. Ready is signaled when the entry calls `ready()` or once its returned promise
   * resolves, whichever comes first. The entry may return, or resolve to, a `stop()` function that
   * runs before the worker exits.
   * @param load - A function importing the bundle entry module.
   * @param arg - The value passed to the entry.
   */
  run(load: () => Promise<{ default: Function }>, arg: unknown): Promise<void>
}

declare class Runtime {
  /**
   * Attach the worker side of a stowed bundle's lifecycle to `stream`.
   * @param stream - The worker side of a stowed bundle's transport, typically `Bare.IPC`.
   */
  constructor(stream: Duplex)
}

/**
 * Attach the worker side of a stowed bundle's lifecycle to `stream`.
 * @param stream - The worker side of a stowed bundle's transport, typically `Bare.IPC`.
 * @returns A `Runtime` multiplexing control and user-data frames over `stream`.
 */
declare function attach(stream: Duplex): Runtime

export { Runtime, attach }
