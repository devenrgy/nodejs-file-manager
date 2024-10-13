import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'

class Hash {
  async calculateHash(file_path) {
    return new Promise((res, rej) => {
      const readStream = createReadStream(file_path, { encoding: 'utf-8' }).pipe(createHash('sha256'))
      let data = ''

      readStream.on('data', (chunk) => (data += chunk.toString('hex')))

      readStream.on('end', () => res(data))

      readStream.on('error', (err) => rej(err))
    })
  }
}

export { Hash }
