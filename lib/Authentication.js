const { readFileSync } = require('fs')

const { log } = require('./utils')

const getCachedCookies = path => {
    const jsonSession = readFileSync(path)
    const session = JSON.parse(jsonSession)

    log('using stored cookies...')
    return session.cookie
}

module.exports = { getCachedCookies }
