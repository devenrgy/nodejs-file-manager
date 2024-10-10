import { readdir, cp } from 'node:fs/promises'
import path from 'node:path'

class FS {
  constructor() {}

  async list(sort) {
    switch (sort) {
      case 'asc':
        return readdir(process.cwd(), { encoding: 'utf-8', withFileTypes: true }).then((data) =>
          data
            .map((file, index) => ({
              Name: file.name,
              Type: file.isDirectory() ? 'directory' : 'file',
            }))
            .sort((a, b) => (a.Type === b.Type ? a.Name.localeCompare(b.Name) : a.Type.localeCompare(b.Type))),
        )
      case 'desc':
        return readdir(dir, { encoding: 'utf-8', withFileTypes: true }).then((data) =>
          data
            .map((file, index) => ({
              Name: file.name,
              Type: file.isDirectory() ? 'directory' : 'file',
            }))
            .sort((a, b) => (a.Type === b.Type ? b.Name.localeCompare(a.Name) : b.Type.localeCompare(a.Type))),
        )
      default:
        return readdir(dir, { encoding: 'utf-8' })
    }
  }

  async cp(oldDir, newDir) {
    return cp(path.join(process.cwd(), oldDir), path.join(process.cwd(), newDir), {
      recursive: true,
      errorOnExist: true,
      force: false,
    })
  }

  cd(newDir) {
    process.chdir(newDir)
  }
}

export { FS }
