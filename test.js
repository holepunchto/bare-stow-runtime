const test = require('brittle')
const Sidecar = require('bare-sidecar')
const host = require('bare-stow-host')

const worker = require.resolve('./test/fixtures/worker.js')

test('runtime signals ready once start resolves', async (t) => {
  const { ipc, exited } = spawn('ready')

  await ipc.ready

  t.is(await ipc.terminate(), 0)
  t.is(await exited, 0)
})

test('runtime signals ready when start calls ready', async (t) => {
  const { ipc, exited } = spawn('early')

  await ipc.ready

  t.is(await ipc.terminate(), 0)
  t.is(await exited, 0)
})

test('runtime carries user data', async (t) => {
  const { ipc } = spawn('echo')

  await ipc.ready

  const echo = new Promise((resolve) => ipc.once('data', resolve))

  ipc.write(Buffer.from('hello'))

  t.alike(await echo, Buffer.from('hello'))
  t.is(await ipc.terminate(), 0)
})

test('runtime runs stop on terminate', async (t) => {
  const { ipc } = spawn('stop')

  await ipc.ready

  const goodbye = new Promise((resolve) => ipc.once('data', resolve))
  const exit = ipc.terminate()

  t.alike(await goodbye, Buffer.from('goodbye'))
  t.is(await exit, 0)
})

test('runtime reports errors thrown by start', async (t) => {
  const { ipc, exited } = spawn('error')

  await t.exception(ipc.ready, /boom/)

  t.is(await exited, 1)
})

test('runtime exits once the configured grace runs out', async (t) => {
  // Leave the exit to the runtime rather than killing it from the host.
  const { ipc, exited } = spawn('stall', { grace: 100, kill: () => {} })

  await ipc.ready

  t.is(await ipc.terminate(), undefined)
  t.is(await exited, 0)
})

test('runtime runs stop on SIGTERM', async (t) => {
  const { ipc, sidecar, exited } = spawn('stop')

  await ipc.ready

  const goodbye = new Promise((resolve) => ipc.once('data', resolve))

  sidecar.kill('SIGTERM')

  t.alike(await goodbye, Buffer.from('goodbye'))
  t.is(await exited, 0)
})

function spawn(mode, opts) {
  const sidecar = new Sidecar(worker, [mode], { stdio: 'inherit' })

  const ipc = host.wrap(sidecar, { kill: () => sidecar.kill('SIGKILL'), ...opts })

  const exited = new Promise((resolve) => {
    sidecar.on('exit', (code, signal) => {
      ipc.exited(code, signal)
      resolve(code)
    })
  })

  return { ipc, sidecar, exited }
}
