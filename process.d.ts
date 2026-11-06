import { Duplex } from 'bare-stream'
import { Runtime } from '.'

/**
 * A `Runtime` for a bundle that owns its process, which also shuts down on `SIGTERM`, `SIGINT`, and `SIGHUP`.
 */
declare class ProcessRuntime extends Runtime {}

/**
 * Attach the worker side of a stowed bundle's lifecycle to `stream`, shutting down on `SIGTERM`, `SIGINT`, and `SIGHUP`.
 * @param stream - The worker side of a stowed bundle's transport, typically `Bare.IPC`.
 * @returns A `Runtime` multiplexing control and user-data frames over `stream`.
 */
declare function attach(stream: Duplex): ProcessRuntime

export { ProcessRuntime as Runtime, attach }
