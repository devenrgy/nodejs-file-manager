import { createInterface } from 'node:readline/promises'
import { stdin, chdir, stdout, cwd, exit } from 'node:process'

import { Os, Cli, Fs, Nav, Zip, Hash } from '#modules'
import { MAN_OS, MAN_COMMANDS } from '#mans'
import { isFunction, handleErrors, splitWithQuotes } from '#utils/helpers.js'
import { CMD_EXIT, CMD_CREATE, CMD_RENAME, CMD_HELP, CMD_UP } from '#utils/constants.js'
import { LOGO } from '#utils/logo.js'

class FileManager {
  _os = new Os()
  _cli = new Cli()
  _fs = new Fs()
  _hash = new Hash()
  _nav = new Nav()
  _zip = new Zip()

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
        chdir('..')
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
        await this[cmd](...args.filter((arg) => arg.trim() !== ''))
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

    chdir(this._os.homedir)
    this._setPrompt()
  }

  _welcome() {
    console.log(`Welcome to the File Manager, ${this.username}!`)
    console.log('To get started, you can type help or --help, -h after any command to learn more about its usage.')
    console.log(
      'You can also use the help command in conjunction with other commands. For example: "help os" will display the available arguments.',
    )
    console.log(
      'If your file or directory paths contain spaces, you must wrap them in either single (\') or double (") quotes for the command to work correctly.',
    )
    console.log("Example 1: cd 'my folder'")
    console.log('Example 2: cp "my folder/file.txt" "another folder/file.txt"')
  }

  async ls(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._nav.ls(dir ?? cwd()))
      .then(...handleErrors)
  }

  async cp(...paths) {
    return splitWithQuotes(paths)
      .then(([old_dir, new_dir]) => this._fs.cp(old_dir, new_dir))
      .then(...handleErrors)
  }

  async mv(...paths) {
    return splitWithQuotes(paths)
      .then(([old_dir, new_dir]) => this._fs.mv(old_dir, new_dir))
      .then(...handleErrors)
  }

  async rm(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._fs.rm(dir))
      .then(...handleErrors)
  }

  async cd(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._nav.cd(dir ?? this._os.homedir))
      .then(...handleErrors)
  }

  async touch(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._fs.touch(dir))
      .then(...handleErrors)
  }

  async cat(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._fs.cat(dir))
      .then(...handleErrors)
  }

  async hash(...paths) {
    return splitWithQuotes(paths)
      .then(([dir]) => this._hash.calculateHash(dir))
      .then(...handleErrors)
  }

  async compress(...paths) {
    return splitWithQuotes(paths)
      .then(([file_path, archive_path]) => this._zip.compress(file_path, archive_path))
      .then(...handleErrors)
  }

  async decompress(...paths) {
    return splitWithQuotes(paths)
      .then(([archive_path, file_path]) => this._zip.decompress(archive_path, file_path))
      .then(...handleErrors)
  }

  pwd() {
    console.log(this._os.currentDir)
  }

  clear() {
    console.clear()
  }

  os(...arg) {
    if (!arg.length) {
      return console.error('No arguments')
    }

    const ARG_NO_PREF = arg[0].slice(2)

    if (arg.length > 1) {
      return console.error('Please provide exactly one argument')
    }

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
        return console.error('Invalid argument!')
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
