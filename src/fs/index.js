import { cp, rm, access, mkdir, constants } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { cwd } from 'node:process'
import { join, dirname } from 'node:path'
import { toBool } from '#utils'

class FS {
  async isExists(path) {
    return access(join(cwd(), path), constants.F_OK).then(...toBool)
  }

  async mkdir(dir) {
    if (!(await this.isExists(dirname(dir)))) {
      await mkdir(join(cwd(), dirname(dir)))
    }
  }

  async cp(oldDir, newDir) {
    await this.mkdir(newDir)

    return new Promise((res, rej) => {
      const readStream = createReadStream(join(cwd(), oldDir), { encoding: 'utf-8' })
      const writeStream = createWriteStream(join(cwd(), newDir), { encoding: 'utf-8' })
      readStream.pipe(writeStream)

      readStream.on('error', (err) => rej(err))
      writeStream.on('error', (err) => rej(err))

      writeStream.on('close', () => res())
    })
  }

  async rm(file_path) {
    return rm(file_path, { recursive: true, force: true })
  }

  async mv(oldDir, newDir) {
    await this.cp(oldDir, newDir)
    return this.rm(oldDir)
  }

  async touch(file_path, content = '') {
    await this.mkdir(file_path)

    return new Promise((res, rej) => {
      const writeStream = createWriteStream(join(cwd(), file_path), { encoding: 'utf-8', flags: 'wx' })

      writeStream.write(content, (err) => (err ? rej(err) : res()))

      writeStream.on('error', (err) => rej(err))
    })
  }

  async cat(file_path) {
    return new Promise((res, rej) => {
      const readStream = createReadStream(join(cwd(), file_path), { encoding: 'utf-8' })
      let data = ''

      readStream.on('data', (chunk) => (data += chunk))

      readStream.on('end', () => res(data))

      readStream.on('error', (err) => rej(err))
    })
  }
}

export { FS }
