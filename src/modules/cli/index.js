import { argv } from 'node:process'

class Cli {
  parseArg(name) {
    if (name) {
      try {
        return argv.findLast((arg) => arg.startsWith(name)).split('=')[1]
      } catch (err) {
        throw new Error(`${name} argument not found! Please use the correct ${name} argument!`)
      }
    }
  }

  parseArgs() {
    return argv.reduce((prev, curr) => {
      if (new RegExp(/^--\w/).test(curr)) {
        const [arg, value] = curr.split('=')
        prev[arg.slice(PREFIX.length)] = value
      }

      return prev
    }, {})
  }
}

export { Cli }
