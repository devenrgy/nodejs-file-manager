import { createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'
import { join, extname } from 'node:path'
import { cwd } from 'node:process'

class Zip {
  async compress(file_path, archive_path) {
    try {
      const ext = extname(archive_path)

      if (ext !== '.br') {
        throw new Error('Missing file extension (.br required)')
      }

      if (!file_path || !archive_path) {
        throw new Error('Invalid arguments provided!')
      }

      await pipeline(
        createReadStream(join(cwd(), file_path), { encoding: 'utf-8' }),
        createBrotliCompress(),
        createWriteStream(join(cwd(), archive_path), { encoding: 'utf-8' }),
      )

      return 'Compression was successful!'
    } catch (err) {
      throw err
    }
  }

  async decompress(archive_path, file_path) {
    try {
      const ext = extname(archive_path)

      if (ext !== '.br') {
        throw new Error('Missing file extension (.br required)')
      }

      if (!file_path || !archive_path) {
        throw new Error('Invalid arguments provided!')
      }

      await pipeline(
        createReadStream(join(cwd(), archive_path)),
        createBrotliDecompress(),
        createWriteStream(join(cwd(), file_path)),
      )

      return 'Decompression was successful!'
    } catch (err) {
      throw err
    }
  }
}

export { Zip }
