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

const ipc = runtime.attach(Bare.IPC)

ipc.run(() => Promise.resolve({ default: entries[Bare.argv[2]] }), ipc)
