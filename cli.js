#!/usr/bin/env node

const program = require('commander')
const { existsSync } = require('fs')

const OBook = require('./lib/OBook')
const { getCachedCookies } = require('./lib/Authentication')
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
    .option('-c, --cookie <cookie>','Session cookies')
    .parse(process.argv)


const sessionCached = (program.bookid && existsSync(SESSION_PATH))
const sessionAsArg = (program.bookid && program.cookie)

const download = async ({ session, bookid }) => {

    const cookie = getCachedCookies(session)

    const ohBooks = new OBook(cookie, bookid)
    return ohBooks.create()
}


if (sessionCached) {

    return download({ session: SESSION_PATH, bookid: program.bookid })

} else if (sessionAsArg) {

    write(SESSION_PATH, { cookie: program.cookie }, true)

    return download({ session: SESSION_PATH, bookid: program.bookid })

} else {

    console.log(`\x1b[1m\x1b[31m
        Something is missing. 
        Make sure to enter -b <bookid> and -c <cookie>.
        Example: \x1b[0m $ obooks -b "121212121212" -c "LONG COOKIE STRING HERE"
        `, '\x1b[0m')

    process.exit(1)
}
