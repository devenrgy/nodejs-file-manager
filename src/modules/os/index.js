import { userInfo, availableParallelism, EOL, cpus as _cpus } from 'node:os'
import { cwd, arch } from 'node:process'
import { formatTime } from '#utils/helpers.js'

class Os {
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
    return cwd()
  }

  get architecture() {
    return arch
  }

  get totalCpus() {
    return availableParallelism()
  }

  get cpus() {
    return _cpus().map(({ model, speed }) => ({ Model: model, 'Clock Rate': speed / 1000 + 'GHz' }))
  }
}

export { Os }
