#!/usr/bin/env node

const program = require('commander')
const { existsSync } = require('fs')

const OBook = require('./lib/OBook')
const { getCachedCookies, GoogleAuthentication } = require('./lib/Authentication')
const { write } = require('./lib/utils')

const SESSION_PATH = './session.json'


console.log('\x1b[1m\x1b[33m', `










          ::::::::  ::: :::::::::   ::::::::   ::::::::  :::    ::: :::::::: 
        :+:    :+: :+  :+:    :+: :+:    :+: :+:    :+: :+:   :+: :+:    :+: 
       +:+    +:+     +:+    +:+ +:+    +:+ +:+    +:+ +:+  +:+  +:+         
      +#+    +:+     +#++:++#+  +#+    +:+ +#+    +:+ +#++:++   +#++:++#++   
     +#+    +#+     +#+    +#+ +#+    +#+ +#+    +#+ +#+  +#+         +#+    
    #+#    #+#     #+#    #+# #+#    #+# #+#    #+# #+#   #+# #+#    #+#     
    ########      #########   ########   ########  ###    ### ########       













`,'\x1b[0m')


program
    .version("1.0.0")
    .option('-b, --bookid <bookid>','[required] OReilly | SafariBooksOnline book identifier')
    .option('-e, --email <email>','OReilly | SafariBooksOnline account email')
    .option('-p, --password <password>','Gmail password')
    .option('-c, --cookie <cookie>','Session cookies')
    .parse(process.argv)


const sessionCached = (program.bookid && existsSync(SESSION_PATH))
const sessionAsArg = (program.bookid && program.cookie)
const sessionInexistent = (program.bookid && program.email && program.password)

const download = async ({ session, bookid, email, password }) => {

    let cookie

    if (session != null) {
        cookie = getCachedCookies(session)
    } else {
        const goAuth = new GoogleAuthentication(email, password)
        cookie = await goAuth.authenticate()
    }

    const ohBooks = new OBook(cookie, bookid)
    return ohBooks.create()
}


if (sessionCached) {

    return download({ session: SESSION_PATH, bookid: program.bookid })

} else if (sessionAsArg) {

    write(SESSION_PATH, { cookie: program.cookie }, true)

    return download({ session: SESSION_PATH, bookid: program.bookid })

} else {

    if (sessionInexistent) {
        return download({
            bookid: program.bookid,
            email: program.email,
            password: program.password
        })
    }
    console.log(`\x1b[1m\x1b[31m
        Something is missing. 
        Make sure to enter -b <bookid>, -e <email> and -p <email-password>.
        Example: \x1b[0m $ obooks -b "121212121212" -e "jen@example.com" -p "mypassword"
        `, '\x1b[0m')

    process.exit(1)
}
