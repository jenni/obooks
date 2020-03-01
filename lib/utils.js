const rp = require('request-promise')
const { writeFileSync } = require('fs')

const req = async (method, url, cookie, body) => {
    const options = {
        uri: url,
        method: method,
        followAllRedirects: true,
        resolveWithFullResponse: true,
        headers: {
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Cookie': cookie,
            'Connection': 'keep-alive'
        },
        body: body,
        json: true
    }

    return rp(options)
}

const downloadIMG = async (options) => {
    try {
      return download.image(options)
    } catch (e) {
      log(`[Obook::downloadIMG] there was an error downloading the image ${options.url} e: ${e}`)
    }
}

const isUrl = (str) => (/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/).test(str)

const write = (to, from, isJson) => {
    if (isJson === null || !isJson) {
        writeFileSync(to, from);
    } else {
        writeFileSync(to, JSON.stringify(from, undefined, 2), 'utf8');
    }
}

const log = (str, obj) => {
    return console.log(`\x1b[1m\x1b[33m+:++:++:++:+      ${str}      +:++:++:++:+\x1b[0m`,
                      (obj !== undefined) ? obj : '')
}

module.exports = { req, write, isUrl, log, downloadIMG }
