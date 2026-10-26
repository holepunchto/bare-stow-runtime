const { Protocol, DEFAULT_GRACE } = require('bare-stow-protocol')

class Runtime extends Protocol {
  constructor(stream) {
    super(stream)

    this._stop = null
    this._grace = DEFAULT_GRACE
    this._readied = false
    this._exitCode = null
    this._connected = true

    const ondisconnect = () => this._ondisconnect()

    this.on('configure', ({ grace }) => {
      this._grace = grace
    }).on('terminate', () => this._shutdown(0))

    stream.on('end', ondisconnect).on('close', ondisconnect)

    Bare.on('beforeExit', (code) => this._shutdown(code))
      .on('uncaughtException', (err) => this._shutdown(1, err))
      .on('unhandledRejection', (err) => this._shutdown(1, err))
  }

  async run(load, arg) {
    try {
      const entry = await load()

      this._stop = await entry.default(arg, () => this._ready())

      this._ready()
    } catch (err) {
      this._shutdown(1, err)
    }
  }

  _ready() {
    if (this._readied) return
    this._readied = true

    this.send('ready')
  }

  async _shutdown(code, err = null) {
    if (this._exitCode !== null) return
    this._exitCode = code

    setTimeout(() => Bare.exit(code), this._grace).unref()

    try {
      if (this._stop) await this._stop()
    } catch (e) {
      err = err || e
    }

    if (this._connected) {
      if (err) this.send('error', { message: err.message, stack: err.stack })

      await this.send('exit', { code })
    }

    Bare.exit(code)
  }

  _ondisconnect() {
    this._connected = false
    this._shutdown(0)
  }
}

exports.Runtime = Runtime

exports.attach = function attach(stream) {
  return new Runtime(stream)
}
