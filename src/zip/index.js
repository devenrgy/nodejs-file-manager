import { createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'
import { join } from 'node:path'
import { cwd } from 'node:process'

class Zip {
  async compress(file_path, archive_path) {
    // if (path.i file_path.slice(-4) !== '.txt') {
    //   file_path += '.txt'
    // }

    ////TODO: add folder zip and catch error and check folder or file
    //if (archive_path.slice(-3) !== '.gz') {
    //  archive_path += '.gz'
    //}

    try {
      return pipeline(
        createReadStream(join(cwd(), file_path), { encoding: 'utf-8' }),
        createBrotliCompress(),
        createWriteStream(join(cwd(), archive_path), { encoding: 'utf-8' }),
      )
    } catch (err) {
      throw err
    }
  }

  async decompress(archive_path, file_path) {
    try {
      return pipeline(
        createReadStream(join(cwd(), archive_path)),
        createBrotliDecompress(),
        createWriteStream(join(cwd(), file_path)),
      )
    } catch (err) {
      throw err
    }
  }
}

export { Zip }
