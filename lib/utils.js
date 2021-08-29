
const isUrl = (str) => (/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/).test(str)

const log = str => console.log(`\x1b[1m\x1b[33m+:++:++:++:+      ${str}\x1b[0m`)

module.exports = { isUrl, log }
