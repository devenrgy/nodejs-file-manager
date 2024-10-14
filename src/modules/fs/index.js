import { cp, rm, access, mkdir, constants } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { cwd } from 'node:process'
import { join, dirname, isAbsolute } from 'node:path'
import { toBool } from '#utils/helpers.js'

class Fs {
  resolvePath(path, to) {
    switch (to) {
      case 'dir':
        return dirname(path)
      default:
        return isAbsolute(path) ? path : join(cwd(), path)
    }
  }

  async isExists(path) {
    return access(path, constants.F_OK).then(...toBool)
  }

  async mkdir(path) {
    try {
      return mkdir(this.resolvePath(path, 'dir'))
    } catch (err) {
      throw err
    }
  }

  async cp(old_dir, new_dir) {
    try {
      if (!old_dir || !new_dir) {
        throw new Error('Invalid arguments provided!')
      }

      const isExistDir = await this.isExists(this.resolvePath(new_dir, 'dir'))

      if (!isExistDir) {
        await this.mkdir(new_dir)
      }

      return new Promise((res, rej) => {
        const readStream = createReadStream(this.resolvePath(old_dir), { encoding: 'utf-8' })
        const writeStream = createWriteStream(this.resolvePath(new_dir), { encoding: 'utf-8' })
        readStream.pipe(writeStream)

        readStream.on('error', (err) => rej(err))
        writeStream.on('error', (err) => rej(err))

        writeStream.on('close', () => res('Copy completed successfully!'))
      })
    } catch (err) {
      throw err
    }
  }

  async rm(file_path) {
    try {
      if (!file_path) {
        throw new Error('Invalid argument!')
      }

      await rm(file_path, { recursive: true })
      return 'Deletion completed successfully!'
    } catch (err) {
      throw err
    }
  }

  async mv(old_dir, new_dir) {
    try {
      if (!old_dir || !new_dir) {
        throw new Error('Invalid arguments provided!')
      }

      await Promise.all([this.cp(old_dir, new_dir), this.rm(old_dir)])
      return 'Move completed successfully!'
    } catch (err) {
      throw err
    }
  }

  async touch(file_path) {
    try {
      if (!file_path) {
        throw new Error('Invalid argument!')
      }

      const isExistDir = await this.isExists(this.resolvePath(file_path, 'dir'))

      if (!isExistDir) {
        await this.mkdir(file_path)
      }

      return new Promise((res, rej) => {
        const writeStream = createWriteStream(this.resolvePath(file_path), {
          encoding: 'utf-8',
          flags: 'wx',
        })

        writeStream.write('', (err) => (err ? rej(err) : res('File created successfully!')))

        writeStream.on('error', (err) => rej(err))
      })
    } catch (err) {
      throw err
    }
  }

  async cat(file_path) {
    try {
      if (!file_path) {
        throw new Error('Invalid argument!')
      }

      return new Promise((res, rej) => {
        const readStream = createReadStream(this.resolvePath(file_path), { encoding: 'utf-8' })
        let data = ''

        readStream.on('data', (chunk) => (data += chunk))

        readStream.on('end', () => res(data))

        readStream.on('error', (err) => rej(err))
      })
    } catch (err) {
      throw err
    }
  }
}

export { Fs }
