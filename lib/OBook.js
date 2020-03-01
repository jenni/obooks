const Epub = require("epub-gen")
const { existsSync, mkdirSync } = require('fs')
const os = require('os')

const { req, log, isUrl, downloadIMG } = require('./utils')

const OREILLY_API_URL = 'https://learning.oreilly.com/api/v1'
const IMG_DEST_PATH = '/usr/local/share/epub_tmp/'
const EBOOK_DEST_PATH = `${os.homedir()}/obooks`

class OBook {

    constructor(cookie, bookid) {
        this.cookie = cookie
        this.bookid = bookid
        this.bookUrl = `${OREILLY_API_URL}/book/${bookid}`
    }

    async create() {
        if (!existsSync(IMG_DEST_PATH)) mkdirSync(IMG_DEST_PATH)
        if (!existsSync(EBOOK_DEST_PATH)) mkdirSync(EBOOK_DEST_PATH)

        const meta = await this.fetch(this.bookUrl)

        if (meta.format !== 'book') {
            log(`${meta.format} format not supported.`)
            process.exit(1)
        }

        const title = meta.title
        const author = this.joinNames(meta.authors)
        const publisher = this.joinNames(meta.publishers)
        const cover = await this.fetchCoverImagePath(meta.chapters)

        const epubOpts = { title, author, publisher, cover, content: [] }

        meta.chapters.shift()
        const chapterUrls = meta.chapters

        log(`Getting:: ${title} ...`)
        log(`${chapterUrls.length} chapters to download, this can take a while...`)

        for (const chapterUrl of chapterUrls) {

            const chapter = await this.fetch(chapterUrl)
            const content = await this.fetch(chapter.content)

            await this.downloadChapterImages(chapter)

            const finalContent = content.replace(/src="/g, `src="${IMG_DEST_PATH}`)

            const chapterOptions = { 
                title: chapter.title,
                author: this.joinNames(chapter.author),
                data: finalContent
            }

            epubOpts.content.push(chapterOptions)
            log(`Done downloading chapter: ${chapter.title}`)
        }

        const filename = title.toLowerCase().replace(/\s+/g, '-')
        new Epub(epubOpts, `${EBOOK_DEST_PATH}/${filename}.epub`)
    }

    async fetch(url) {
        const res = await req('GET', url, this.cookie, null)
        return res.body
    }

    async fetchCoverImagePath(chapters) {
        const coverUrl = chapters.filter(c => c.includes('cover') || c.includes('titlepage'))[0]

        if (coverUrl !== undefined) {
            const titlePage = await this.fetch(coverUrl, this.cookie, 'GET')
            const coverImage = this.guessCoverImage(titlePage.images)

            const fullPath = titlePage.asset_base_url + coverImage
            return isUrl(fullPath) ? fullPath : null
        }

        return null
    }

    guessCoverImage(images) {
        return images
            .filter(image => image === 'cover.jpg')
            .length ? images[0] : null
    }

    async downloadChapterImages(chapter) {
        const assetBaseUrl = chapter.asset_base_url
        const images = chapter.images

        if (!images.length) return

        for (const image of images) {
            const imageUrl = assetBaseUrl + image
            // * chapter.images can contain part of the path -> 'dest/image.jpg'
            const { path, filename } = this.getFragmentedPath(image)
            const finalPath = IMG_DEST_PATH + path
            const dest = finalPath + filename

            console.log(imageUrl)
            console.log(dest)

            if (!existsSync(finalPath)) mkdirSync(finalPath)

            await downloadIMG({ url: imageUrl, dest })
        }
    }

    getFragmentedPath(image) {
        const fullPath = image.split(/(\/)/)
        const filename = fullPath.pop()
        const path = fullPath.join('')

        return { path, filename }
    }

    joinNames(arr) {
        return (arr != null && arr.length)
            ? arr.map(a => a.name).join(', ')
            : ''
    }

    static async lookupEmail(email) {
        const domain = email.split('@')[1]
        const lookupEmailUrl = 'https://www.oreilly.com/member/auth/corporate/lookup/'
        const body = { domain }

        try {
            const res = await req('POST', lookupEmailUrl, null, body)
            return res.body;
        } catch(e) {
            console.log('[OBook::lookupEmail] There was an error during email lookup ', e)
            process.exit(1)
        }
    }
}

module.exports = OBook