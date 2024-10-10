import { userInfo, availableParallelism, EOL, cpus as _cpus } from 'node:os'
import { formatTime } from '#utils'

class OS {
  constructor() {
    this.info = userInfo()
    this.systemUsername = this.info.username
    this._username = this.systemUsername.charAt(0).toUpperCase() + this.systemUsername.slice(1)
  }

  get username() {
    return this._username
  }

  get eol() {
    return EOL
  }

  get homedir() {
    return this.info.homedir
  }

  get time() {
    const date = new Date()
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(formatTime).join(':')
  }

  get currentDir() {
    return process.cwd()
  }

  get architecture() {
    return process.arch
  }

  get totalCpus() {
    return availableParallelism()
  }

  get cpus() {
    return _cpus().map(({ model, speed }) => ({ Model: model, 'Clock Rate': speed / 1000 + 'GHz' }))
  }
}

export { OS }
