import { readdir } from 'node:fs/promises'
import { chdir } from 'node:process'

class Nav {
  async ls(dir, sort) {
    switch (sort) {
      case 'asc':
        return readdir(dir, { encoding: 'utf-8', withFileTypes: true }).then((data) =>
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

  cd(dir) {
    chdir(dir)
  }
}

export { Nav }
