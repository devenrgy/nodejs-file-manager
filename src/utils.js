const isFunction = (value) => typeof value === 'function'

const formatTime = (number) => (number < 10 ? '0' + number : number)

const toBool = [() => true, () => false]

export { isFunction, formatTime, toBool }
