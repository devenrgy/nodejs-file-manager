import { createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGzip, createGunzip } from 'node:zlib'
import path from 'node:path'

class Zip {
  async compress(file_path, archive_path) {
    // if (path.i file_path.slice(-4) !== '.txt') {
    //   file_path += '.txt'
    // }

    //TODO: add folder zip and catch error and check folder or file
    if (archive_path.slice(-3) !== '.gz') {
      archive_path += '.gz'
    }

    return pipeline(
      createReadStream(path.join(process.cwd(), file_path), { encoding: 'utf-8' }),
      createGzip(),
      createWriteStream(path.join(process.cwd(), archive_path), { encoding: 'utf-8' }),
    )
  }

  async decompress(archive_path, file_path) {
    return pipeline(
      createReadStream(path.join(process.cwd(), archive_path)),
      createGunzip(),
      createWriteStream(path.join(process.cwd(), file_path)),
    )
  }
}

export { Zip }
