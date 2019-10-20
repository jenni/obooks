const rp = require('request-promise')
const { writeFileSync, existsSync } = require('fs')

const rq = async (url, cookie, method) => {
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
        json: true
    }

    const res = await rp(options)
    return res
}

const rqImage = async (cookie, url, dest) => {
    if (!existsSync(dest)) {
        const options = {
            url: url,
            encoding: null,
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Cache-Control': 'no-cache',
                'Cookie': cookie,
                'Connection': 'keep-alive'
            },
        }

        const res = await rp(options)
        write(dest, res)
    }
}

const isUrl = (str) => {
    const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
    return regex.test(str);
}

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

module.exports = { rq, rqImage, write, isUrl, log }
