import { pipeline } from 'node:stream/promises'
import { createInterface } from 'node:readline/promises'

import { OS } from './os/index.js'
import { CLI } from './cli/index.js'

class FileManager {
  _os = new OS()
  _cli = new CLI()
  // fs = new FS()
  // hash = new Hash()
  // nav = new Nav()
  // zip = new Zip()
  // err = new CustomError()

  setupInputListener() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.on('close', () => this.exit())

    rl.on('line', (data) => {
      const [methodName, ...args] = data.trim().split(' ')

      if (methodName === '.exit') {
        this.exit()
      }

      if (this[methodName] && typeof this[methodName] === 'function') {
        this[methodName](...args)
      } else {
        console.error(`Method "${methodName}" not found`)
      }
    })
  }

  setupLogin() {
    try {
      this.username = this._cli.parseArg('--username')
    } catch (err) {
      console.error(err.message)
      console.warn('The system username will be used!')
      this.username = this._os.username
    }
  }

  init() {
    this.setupLogin()
    this.setupInputListener()
    console.log(`Welcome to the File Manager, ${this.username}!`)
  }

  ls() {}
  cd() {}
  cp() {}
  rm() {}
  move() {}
  touch() {}
  cat() {}

  hash() {}

  compress() {}
  decompress() {}

  os(arg) {
    if (!arg) {
      return console.error('No arguments')
    }

    const ARG_NO_PREF = arg.slice(2)

    switch (ARG_NO_PREF.toLowerCase()) {
      case 'eol':
        return console.log(this._os.eol)
      case 'cpus':
        return console.table(this._os.cpus)
      case 'homedir':
        return console.log(this._os.homedir)
      case 'username':
        return console.log(this._os.username)
      case 'architecture':
        return console.log(this._os.architecture)
      default:
        return console.error('Invalid argument')
    }
  }

  exit() {
    console.log(`Thank you for using File Manager, ${this.username}, goodbye!`)
    process.exit(0)
  }
}

export { FileManager }
