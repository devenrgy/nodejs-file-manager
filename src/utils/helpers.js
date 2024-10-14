const isFunction = (value) => typeof value === 'function'

const formatTime = (number) => (number < 10 ? '0' + number : number)

const toBool = [() => true, () => false]

const handleErrors = [console.log, (err) => console.error(err.message)]

const splitWithQuotes = async (paths) => {
  return new Promise((res) => {
    const matches = paths.join(' ').match(/(['"])(.*?)\1|\S+/g)

    if (!matches) {
      res([null])
    }

    const quotesCount = (paths.join(' ').match(/['"]/g) || []).length

    if (quotesCount % 2 !== 0) {
      throw new Error('Invalid path format provided')
    }

    res(matches.map((s) => s.replace(/['"]/g, '')))
  })
}

export { isFunction, formatTime, toBool, handleErrors, splitWithQuotes }
