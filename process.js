const Signal = require('bare-signals')
const { Runtime } = require('.')

class ProcessRuntime extends Runtime {
  constructor(stream) {
    super(stream)

    for (const name of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
      new Signal(name)
        .on('signal', () => this._onsignal())
        .start()
        .unref()
    }
  }

  _onsignal() {
    if (this._exitCode !== null) Bare.exit(this._exitCode)
    else this._shutdown(0)
  }
}

exports.Runtime = ProcessRuntime

exports.attach = function attach(stream) {
  return new ProcessRuntime(stream)
}
