import { createInterface } from 'node:readline/promises'

import { OS } from './os/index.js'
import { CLI } from './cli/index.js'
import { FS } from './fs/index.js'
import { Zip } from './zip/index.js'

import { MAN_OS, MAN_COMMANDS } from '#mans'
import { isFunction } from '#utils'
import { CMD_EXIT, CMD_HELP, CMD_UP } from '#constants'
import { LOGO } from '#logo'

class FileManager {
  _os = new OS()
  _cli = new CLI()
  _fs = new FS()
  // hash = new Hash()
  // nav = new Nav()
  _zip = new Zip()
  // err = new CustomError()

  _setupInputListener() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    this.rl.on('close', () => this.exit())

    this.rl.on('line', async (data) => {
      const [cmd, ...args] = data.trim().split(' ')

      if (!cmd) {
        return this._setPrompt()
      }

      if (cmd.startsWith('_')) {
        console.error(`Command '${cmd}' not found!`)
        return this._setPrompt()
      }

      if (CMD_UP.includes(cmd)) {
        this.cd('..')
        return this._setPrompt()
      }

      if (CMD_HELP.includes(cmd)) {
        this.help()
        return this._setPrompt()
      }

      if (CMD_EXIT.includes(cmd)) {
        this.exit()
      }

      if (isFunction(this[cmd])) {
        //TODO: think about this method
        await this[cmd](...args.join(' ').trim().split(' '))
      } else {
        console.error(`Command '${cmd}' not found!`)
      }

      this._setPrompt()
    })
  }

  _setPrompt() {
    this.rl.setPrompt(this._os.eol + '┌──────' + this._os.currentDir + this._os.eol + `└──[ ${this._os.time} ] ➜ `)
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

    console.log(LOGO)

    this._setupLogin()
    this._welcome()
    this._setupInputListener()
    this._setPrompt()
  }

  _welcome() {
    console.log(`Welcome to the File Manager, ${this.username}!`)
    console.log('To get started, you can type help or --help, -h after any command to learn more about its usage.')
    console.log(
      'You can also use the help command in conjunction with other commands. For example: "help os" will display the available arguments.',
    )
  }

  // TODO: add .catch and console.error
  async ls() {
    console.table(await this._fs.list('asc'))
  }

  // TODO: add .catch and console.error
  async cp(oldDir, newDir) {
    await this._fs.cp(oldDir, newDir)
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

  help(command) {
    switch (command) {
      case 'os':
        console.table(MAN_OS)
        break
      default:
        console.table(MAN_COMMANDS)
    }
  }

  hash() {}

  async compress(file_path, archive_path) {
    await this._zip.compress(file_path, archive_path)
    console.log('The compression was successful!')
  }

  async decompress(archive_path, file_path) {
    await this._zip.decompress(archive_path, file_path)
    console.log('The decompression was successful!')
  }

  //TODO: ADD MULTI RUN COMMAND
  os(arg) {
    if (!arg) {
      return console.error('No arguments')
    }

    const ARG_NO_PREF = arg.slice(2)

    switch (ARG_NO_PREF.toLowerCase()) {
      case 'eol':
        return console.log(JSON.stringify(this._os.eol))
      case 'cpus':
        console.table(this._os.cpus)
        return console.log(`Total Cores: ${this._os.totalCpus}`)
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
