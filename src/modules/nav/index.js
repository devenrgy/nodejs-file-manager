import { readdir } from 'node:fs/promises'
import { chdir } from 'node:process'

class Nav {
  async ls(dir) {
    try {
      const list = await readdir(dir, { encoding: 'utf-8', withFileTypes: true })

      const sortList = list
        .map((file, index) => ({
          Name: file.name,
          Type: file.isDirectory() ? 'directory' : 'file',
        }))
        .sort((a, b) => (a.Type === b.Type ? a.Name.localeCompare(b.Name) : a.Type.localeCompare(b.Type)))

      console.table(sortList)
      return `Total: ${sortList.length}`
    } catch (err) {
      throw new Error('Operation failed!')
    }
  }

  async cd(dir) {
    return new Promise((res, rej) => {
      try {
        chdir(dir)
        res(`Directory changed to ${dir} successfully!`)
      } catch (err) {
        throw new Error('Operation failed!')
      }
    })
  }
}

export { Nav }
