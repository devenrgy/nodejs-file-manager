const isFunction = (value) => typeof value === 'function'

const formatTime = (number) => (number < 10 ? '0' + number : number)

export { isFunction, formatTime }
