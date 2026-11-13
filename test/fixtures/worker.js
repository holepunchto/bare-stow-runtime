const runtime = require('../../process')

const entries = {
  ready() {},
  early(ipc, ready) {
    ready()

    return new Promise(() => {})
  },
  echo(ipc) {
    ipc.on('data', (data) => ipc.write(data))
  },
  error() {
    throw new Error('boom')
  },
  stop(ipc) {
    return () => ipc.write(Buffer.from('goodbye'))
  },
  stall() {
    return () => new Promise(() => {})
  }
}

const loaders = {
  esm: () => require('./esm.mjs'),
  transpiled: () => require('./transpiled.js'),
  import: () => import('./esm.mjs')
}

const mode = Bare.argv[2]

const ipc = runtime.attach(Bare.IPC)

ipc.run(loaders[mode] || (() => entries[mode]), ipc)
