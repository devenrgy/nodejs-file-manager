import { readdir } from 'node:fs/promises'
import { cp } from 'node:fs/promises'

class FS {
  constructor() {}

  async list(dir) {
    return readdir(dir, { encoding: 'utf-8' })
  }

  async cp(oldDir, newDir) {
    return cp(oldDir, newDir, { recursive: true, errorOnExist: true, force: false })
  }

  cd(newDir) {
    process.chdir(newDir)
  }
}

export { FS }
