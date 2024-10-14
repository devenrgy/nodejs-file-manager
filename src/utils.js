const isFunction = (value) => typeof value === 'function'

const formatTime = (number) => (number < 10 ? '0' + number : number)

const toBool = [() => true, () => false]

const handleErrors = [console.log, (err) => console.error(err.message)]

export { isFunction, formatTime, toBool, handleErrors }
