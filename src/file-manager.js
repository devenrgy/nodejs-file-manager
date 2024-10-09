import { pipeline } from 'node:stream/promises'
import { createInterface } from 'node:readline/promises'

import { OS } from './os/index.js'
import { CLI } from './cli/index.js'
import { FS } from './fs/index.js'

class FileManager {
  _os = new OS()
  _cli = new CLI()
  _fs = new FS()
  // hash = new Hash()
  // nav = new Nav()
  // zip = new Zip()
  // err = new CustomError()

  _setupInputListener() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    this.rl.on('close', () => this.exit())

    //TODO: FIX return many this._setPrompt
    this.rl.on('line', async (data) => {
      const [methodName, ...args] = data.trim().split(' ')

      if (!methodName) {
        return this._setPrompt()
      }

      if (methodName.startsWith('_')) {
        console.error(`Command '${methodName}' not found!`)
        return this._setPrompt()
      }

      if (methodName === '..') {
        this.cd(methodName)
        return this._setPrompt()
      }

      if (['.q', '.quit', '.exit'].includes(methodName)) {
        this.exit()
      }

      if (typeof this[methodName] === 'function') {
        await this[methodName](...args)
      } else {
        console.error(`Command '${methodName}' not found!`)
      }

      this._setPrompt()
    })
  }

  _setPrompt() {
    this.rl.setPrompt(this._os.eol + this._os.currentDir + this._os.eol + '❯ ')
    this.rl.prompt()
  }

  _setupLogin() {
    try {
      this.username = this._cli.parseArg('--username')
    } catch (err) {
      console.error(err.message)
      console.warn('The system username will be used!')
      this.username = this._os.username
    }
  }

  _init() {
    this.clear()
    this._setupLogin()
    console.log(`Welcome to the File Manager, ${this.username}!`)

    this._setupInputListener()
    this._setPrompt()
  }

  // TODO: add .catch and console.error
  async ls() {
    console.table(await this._fs.list(this._os.currentDir))
  }

  // TODO: add .catch and console.error
  async cp(oldDir, newDir) {
    await this._fs.cp(`${this._os.currentDir}/${oldDir}`, `${this._os.currentDir}/${newDir}`)
    console.log('Copying successfully completed')
  }
  rm() {}
  cd(newDir) {
    this._fs.cd(newDir)
  }
  touch() {}
  cat() {}
  pwd() {
    console.log(this._os.currentDir)
  }
  clear() {
    console.clear()
  }

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
        return console.log(JSON.stringify(this._os.eol))
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
    console.log(this._os.eol.repeat(2) + `Thank you for using File Manager, ${this.username}, goodbye!`)
    process.exit(0)
  }
}

export { FileManager }
