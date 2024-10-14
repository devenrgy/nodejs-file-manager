import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import { checkRequiredArgs } from '#utils/helpers.js'

class Hash {
  async calculateHash(file_path) {
    try {
      checkRequiredArgs(file_path)

      return new Promise((res, rej) => {
        const readStream = createReadStream(file_path, { encoding: 'utf-8' })
        const hash = createHash('sha256')

        readStream.on('readable', () => {
          const data = readStream.read()

          if (data) {
            hash.update(data)
          }
        })

        readStream.on('end', () => res(hash.digest('hex')))

        hash.on('error', (err) => rej(err))
        readStream.on('error', (err) => rej(err))
      })
    } catch (err) {
      throw err
    }
  }
}

export { Hash }
