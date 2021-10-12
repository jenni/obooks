const COVER_PAGE = require('../data/cover-page-data')
const META_PAGE = require('../data/meta-data')
const { CHAPTERS, CHAPTER_URLS } = require('../data/chapters-data')
const { CONTENTS, CONTENT_URLS } = require('../data/contents-data')

async function fetch(url, cookie) {
    if (url === 'https://learning.oreilly.com/api/v1/book/123456') {
        return META_PAGE
    }
    if (url === 'https://learning.oreilly.com/api/v1/book/9781617292231/chapter/OEBPS/Text/titlepage.xhtml') {
        return COVER_PAGE
    }
}

async function parallelFetch(urls, cookie) {
    if (JSON.stringify(urls) === JSON.stringify(CHAPTER_URLS)) {
        return CHAPTERS
    }
    if (JSON.stringify(urls) === JSON.stringify(CONTENT_URLS)) {
        return CONTENTS
    }
}

async function downloadIMG(options) {
    return { filename: 'folder/mock-img.jpg', image: 'mock-img' }
}


module.exports = {
    fetch,
    parallelFetch,
    downloadIMG
}
