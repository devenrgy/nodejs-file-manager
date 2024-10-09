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
    return JSON.stringify(EOL)
  }

  get homedir() {
    return userInfo().homedir
  }

  get architecture() {
    return process.arch
  }

  get cpus() {
    return _cpus().map(({ model, speed }) => ({ model, speed }))
  }
}

export { OS }
