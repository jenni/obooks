const puppeteer = require('puppeteer')
const { readFileSync } = require('fs')

const OBook = require('./OBook')
const { rq, write, log } = require('./utils')

const OREILLY_OAUTH_LINK = 'http://oreilly.com/member/login/?next=%2Fapi%2Fv1%2Fauth%2Fopenid%2Fauthorize%3Fscope%3Dopenid%2Bprofile%2Bemail%26client_id%3D235442%26state%3DcnhscRy9cKEsXPIyh8Ho2IVqG0NdMH5R%26redirect_uri%3Dhttps%3A%2F%2Flearning.oreilly.com%2Fcomplete%2Funified%2F%26login_context%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpbWFnZSI6Imljb25fYWxlcnRfdGVhbC5wbmciLCJtZXNzYWdlIjoiTG9naW4gaXMgbm93IHVuaWZpZWQgYWNyb3NzIE8nUmVpbGx5LiBQbGVhc2UgdXNlIHlvdXIgTydSZWlsbHkgY3JlZGVudGlhbHMgdG8gYWNjZXNzIHlvdXIgT25saW5lIExlYXJuaW5nIGFjY291bnQuIiwibGlua3MiOnsic2lnbl91cCI6eyJ0ZXh0IjoiU3RhcnQgYSBmcmVlIHRyaWFsLiIsImxpbmsiOiJodHRwczovL2xlYXJuaW5nLm9yZWlsbHkuY29tL3JlZ2lzdGVyLyJ9fX0.Nh-qjdUCam7vmBES1j5EKu3cLQMExW_mI66N-VISAM6Q5IWO85Rjk1qXjYFC_lszIam4JZiDt5hXXrW0JZvu-QHej5uveFyWBRxzwMJ9p9i5fMRrF7Z5xsV27ku252-3yVzH7rMsjuRjOP8xVcNZTpOg1a4eK9H-I0NSxCEnTL8UQl4FxuW2d9OAsFW6jMxwVNyxTBbsBVXBncGrcla-b1XSY0ndWWqhfds7g3AqAL2BjlfI-4yKkY3Zu-romtDL2mxwqfM_yO9JGbpr6D3ScDS6k9DySojDaXyZBTIPSbLTemwuQUmcy_VPbYwokNZ4GECg4BRD0W11r0L-090bAA%26response_type%3Dcode&locale=en'

class GoogleAuthentication {

    constructor(email, password, code) {
        this.email = email;
        this.password = password;
        this.code = code;
        this.selectors = {
            oreilly: {
                oauth: {
                    google: ['.google--2DRBN']
                }
            },
            google: {
                email: [
                    'input[id="Email"]',
                    'input[type="email"]',
                ],
                password: [
                    'input[id="Passwd"]',
                    'input[type="password"]',
                ],
                button: [
                    'div[id="identifierNext"]',
                    'div[id="passwordNext"]',
                    'input[id="next"]',
                    'input[id="signIn"]',
                    'input[name="signIn"]',
                    'div[id="backupCodeNext"]'
                ],
                tryAnotherWay: ['input[id="skipChallenge"]'],
                backupCodeOptions: [
                    'div[data-challengeindex="3"]',
                    'form[data-challengeentry="2"]'
                ],
                backupCodeInput: ['input[type="tel"]'],
            }
        }
    }

    async authenticate() {
        const loginUrl = await this.getLoginUrl()
        const gmailPage = await this.goToLoginPage(loginUrl)
        const oreillyPage = await this.login(gmailPage)

        return saveCookies(oreillyPage)
    }

    async login(page) {
        try {
            log('loging in... might take a while')
            const opts = {
                email: {
                    selector: this.selectors.google.email,
                    value: this.email
                },
                password: {
                    selector: this.selectors.google.password,
                    value: this.password
                },
                backupCode: {
                    selector: this.selectors.google.backupCodeInput,
                    value: this.code
                },
                button: this.selectors.google.button
            }

            await typeAndNext(page, opts.email, opts.button)
            log('introduced email address in gmail')
            await typeAndNext(page, opts.password, opts.button)
            log('introduced email password in gmail')

            if (this.code !== undefined) {
                try {
                    const tryAnotherWayBtn = await getElement(page, this.selectors.google.tryAnotherWay)
                    await tryAnotherWayBtn.click()

                    return this.enterBackupCode(page, opts)
                } catch(e) {
                    try {
                        return this.enterBackupCode(page, opts)
                    } catch(e) {
                        log(`something went weird...`, e)
                        log(`exiting...`)
                        process.exit(1)
                    }
                }
            }

            await page.waitForNavigation({ waitUntil: 'networkidle0' })

            if (!page.url().includes('oreilly.com')) {
                await page.waitForNavigation({ waitUntil: 'networkidle0' })
            }

            log('logged in to Oreilly')

            return page
        } catch(e) {
            log('there was an issue logging in ', e)
            process.exit(1)
        }

    }

    async goToLoginPage(loginUrl) {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto(loginUrl)

        if (loginUrl === OREILLY_OAUTH_LINK) {
            const oauth = await getElement(page, this.selectors.oreilly.oauth.google)
            await oauth.click()
            await page.waitForNavigation({ waitUntil: 'networkidle0' })

            return page
        }

        return page
    }

    async getLoginUrl() {
        const body = await OBook.lookupEmail(this.email)
        const redirectUrl = body.redirect_uri

        if (body.is_corporate === true) {
            log(`redirecting to corporate login`)
            try {
                const res = await rq(redirectUrl, null, 'GET')
                return res.request.uri.href
            } catch(e) {
                log('[Authentication::getLoginUrl()] There was an error getting the login url ', e)
                process.exit(1)
            }
        } else {
            return OREILLY_OAUTH_LINK
        }
    }

    async enterBackupCode(page, opts) {
        const backupCodeOption = await getElement(page, this.selectors.google.backupCodeOptions)
        await backupCodeOption.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        await typeAndNext(page, opts.backupCode, opts.button)
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        return page
    }
}

const typeAndNext = async (page, input, buttonSelector) => {
    const inputElement = await getElement(page, input.selector)
    await inputElement.type(input.value)
    await page.waitFor(1000)

    const button = await getElement(page, buttonSelector)
    await button.click()
    await page.waitFor(1000)
}

const getElement = async (page, arr) => {
    const promisedElements = arr.map(el => page.waitForSelector(el, { visible: true }))
    return Promise.race(promisedElements)
}

const saveCookies = async (page) => {
    const cookies = await page.cookies()

    if (cookies.filter(cookie => cookie.name === 'sessionid').length == 0) {
        log('there was an issue retrieving cookies ', cookies)
        process.exit(1)
    }

    const cookie = constructCookieHeader(cookies)

    write('./session.json', { cookie }, true)
    log('saved new cookies...')
    return cookie
}

const constructCookieHeader = (cookies) => {
    return cookies.map(cookie => cookie.name + '=' + cookie.value).join(';')
}

const getCachedCookies = (path) => {
    const jsonSession = readFileSync(path)
    const session = JSON.parse(jsonSession)

    log('using stored cookies...')
    return session.cookie
}


module.exports = { GoogleAuthentication, getCachedCookies }
