class CLI {
  parseArg(name) {
    if (name) {
      try {
        return process.argv.findLast((arg) => arg.startsWith(name)).split('=')[1]
      } catch (err) {
        throw new Error(`${name} argument not found! Please use the correct ${name} argument!`)
      }
    }
  }

  parseArgs() {
    return process.argv.reduce((prev, curr) => {
      if (new RegExp(/^--\w/).test(curr)) {
        const [arg, value] = curr.split('=')
        prev[arg.slice(PREFIX.length)] = value
      }

      return prev
    }, {})
  }
}

export { CLI }
