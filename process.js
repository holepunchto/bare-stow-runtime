const Signal = require('bare-signals')
const { Runtime } = require('.')

class ProcessRuntime extends Runtime {
  constructor(stream) {
    super(stream)

    new Signal('SIGTERM')
      .on('signal', () => this._onsigterm())
      .start()
      .unref()
  }

  _onsigterm() {
    if (this._exitCode !== null) Bare.exit(this._exitCode)
    else this._shutdown(0)
  }
}

exports.Runtime = ProcessRuntime

exports.attach = function attach(stream) {
  return new ProcessRuntime(stream)
}
