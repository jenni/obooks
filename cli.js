#!/usr/bin/env node

const program = require('commander')
const { existsSync } = require('fs')

const OBook = require('./lib/OBook')
const { getCachedCookies, GoogleAuthentication } = require('./lib/authentication')

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
    .option('-c, --code <backupcode>','Gmail MFA backup code')
    .parse(process.argv)



const main = async ({ session, bookid, email, password, code }) => {

    let cookie

    if (session != null) {
        cookie = getCachedCookies(session)
    } else {
        const goAuth = new GoogleAuthentication(email, password, code)
        cookie = await goAuth.authenticate()
    }

    const ohBooks = new OBook(cookie, bookid)
    return ohBooks.create()
}

if (program.bookid && existsSync(SESSION_PATH)) {
    return main({ bookid: program.bookid, session: SESSION_PATH })
} else {
    if (program.bookid && program.email && program.password) {
        return main({
            bookid: program.bookid,
            email: program.email,
            password: program.password,
            code: program.code
        })
    }
    console.log(`\x1b[1m\x1b[31m
        Something is missing. 
        Make sure to enter -b <bookid>, -e <email> and -p <email-password>.
        Example: \x1b[0m $ obooks -b "121212121212" -e "jen@example.com" -p "mypassword"
        `, '\x1b[0m')
    return
}
