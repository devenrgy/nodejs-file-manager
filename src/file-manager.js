import { createInterface } from 'node:readline/promises'
import { stdin, stdout, cwd, exit } from 'node:process'

import { OS } from './os/index.js'
import { CLI } from './cli/index.js'
import { FS } from './fs/index.js'
import { Nav } from './nav/index.js'
import { Zip } from './zip/index.js'
import { Hash } from './hash/index.js'

import { MAN_OS, MAN_COMMANDS } from '#mans'
import { isFunction, handleErrors } from '#utils'
import { CMD_EXIT, CMD_CREATE, CMD_RENAME, CMD_HELP, CMD_UP } from '#constants'
import { LOGO } from '#logo'

class FileManager {
  _os = new OS()
  _cli = new CLI()
  _fs = new FS()
  _hash = new Hash()
  _nav = new Nav()
  _zip = new Zip()
  // err = new CustomError()

  _setupInputListener() {
    this.rl = createInterface({
      input: stdin,
      output: stdout,
    })

    this.rl.on('close', () => this.quit())

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

      if (CMD_RENAME.includes(cmd)) {
        this.mv(...args)
        return this._setPrompt()
      }

      if (CMD_CREATE.includes(cmd)) {
        this.touch(...args)
        return this._setPrompt()
      }

      if (CMD_EXIT.includes(cmd)) {
        this.quit()
      }

      if (isFunction(this[cmd])) {
        //TODO: think about this method
        //.join(' ').trim().split(' ')
        await this[cmd](...args)
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

    //TODO:
    //this.cd()
    this._setPrompt()
  }

  _welcome() {
    console.log(`Welcome to the File Manager, ${this.username}!`)
    console.log('To get started, you can type help or --help, -h after any command to learn more about its usage.')
    console.log(
      'You can also use the help command in conjunction with other commands. For example: "help os" will display the available arguments.',
    )
  }

  async ls(...dir) {
    return this._nav.ls(dir.join(' ') || cwd())
  }

  async cp(old_dir, new_dir) {
    return this._fs.cp(old_dir, new_dir).then(...handleErrors)
  }

  async mv(old_dir, new_dir) {
    return this._fs.mv(old_dir, new_dir).then(...handleErrors)
  }

  async rm(...file_path) {
    return this._fs.rm(file_path.join(' ')).then(...handleErrors)
  }

  async cd(...dir) {
    return this._nav.cd(dir.join(' ') || this._os.homedir).then(...handleErrors)
  }

  async touch(...file_path) {
    return this._fs.touch(file_path.join(' ')).then(...handleErrors)
  }

  async cat(...file_path) {
    return this._fs.cat(file_path.join(' ')).then(...handleErrors)
  }

  async hash(...file_path) {
    return this._hash.calculateHash(file_path.join(' ')).then(...handleErrors)
  }

  async compress(file_path, archive_path) {
    return this._zip.compress(file_path, archive_path).then(...handleErrors)
  }

  async decompress(archive_path, file_path) {
    return this._zip.decompress(archive_path, file_path).then(...handleErrors)
  }

  pwd() {
    console.log(this._os.currentDir)
  }

  clear() {
    console.clear()
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

  help(cmd) {
    switch (cmd) {
      case 'os':
        console.table(MAN_OS)
        break
      default:
        console.table(MAN_COMMANDS)
    }
  }

  quit() {
    console.log(this._os.eol.repeat(2) + `Thank you for using File Manager, ${this.username}, goodbye!`)
    exit(0)
  }
}

export { FileManager }
