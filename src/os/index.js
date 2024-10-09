import { userInfo, EOL, cpus as _cpus } from 'node:os'

class OS {
  constructor() {
    this.systemUsername = userInfo().username
    this._username = this.systemUsername.charAt(0).toUpperCase() + this.systemUsername.slice(1)
  }

  get username() {
    return this._username
  }

  get eol() {
    return EOL
  }

  get homedir() {
    return userInfo().homedir
  }

  get currentDir() {
    return process.cwd()
  }

  get architecture() {
    return process.arch
  }

  get cpus() {
    return _cpus().map(({ model, speed }) => ({ model, speed }))
  }
}

export { OS }
