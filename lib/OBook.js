const Epub = require("epub-gen")
const { existsSync, mkdirSync } = require('fs')
const os = require('os')

const { rq, log, rqImage, isUrl } = require('./utils')

class OBook {

    API_URL = 'https://learning.oreilly.com/api/v1'
    IMG_DEST_PATH = '/usr/local/share/epub_tmp/'
    EBOOK_DEST_PATH = `${os.homedir()}/obooks`

    constructor(cookie, bookid) {
        this.cookie = cookie
        this.bookid = bookid
        this.baseUrl = `${this.API_URL}/book/${bookid}` 
        this.api = {
            titlePage: `${this.baseUrl}/chapter/titlepage.xhtml`
        }
    }

    async create() {
        if (!existsSync(this.IMG_DEST_PATH)) mkdirSync(this.IMG_DEST_PATH)
        if (!existsSync(this.EBOOK_DEST_PATH)) mkdirSync(this.EBOOK_DEST_PATH)

        const meta = await this.fetch(this.baseUrl)
        const title = meta.title
        const author = this.joinNames(meta.authors)
        const publisher = this.joinNames(meta.publishers)
        const cover = await this.fetchCoverImagePath()

        const options = { title, author, publisher, cover, content: [] }

        meta.chapters.shift()
        const chapterUrls = meta.chapters
        log(`Getting ${title} ...`)
        log(`${chapterUrls.length} chapters to download, this can take a while...`)

        for (const chapterUrl of chapterUrls) {

            const chapter = await this.fetch(chapterUrl)
            const content = await this.fetch(chapter.content)
            await this.downloadChapterImages(chapter)

            const finalContent = content.replace(/src="/g, `src="${this.IMG_DEST_PATH}`)

            const chapterOptions = { 
                title: chapter.title,
                author: this.joinNames(chapter.author),
                data: finalContent
            }

            options.content.push(chapterOptions)
        }

        const filename = title.toLowerCase().replace(/\s+/g, '-')
        new Epub(options, `${this.EBOOK_DEST_PATH}/${filename}.epub`)
    }

    async fetch(url) {
        const res = await rq(url, this.cookie, 'GET')
        return res.body
    }

    async fetchCoverImagePath() {
        const titlePage = await this.fetch(this.api.titlePage, this.cookie, 'GET')
        const cover = titlePage.images.filter(image => image === 'cover.jpg')
        const fullPath = titlePage.asset_base_url + cover

        return isUrl(fullPath) ? fullPath : null
    }

    async downloadChapterImages(chapter) {
        const assetBaseUrl = chapter.asset_base_url
        const images = chapter.images

        if (!images.length) return

        for (const image of images) {
            const imagePath = assetBaseUrl + image
            // * chapter.images can contain part of the path -> 'dest/image.jpg'
            const { path, filename } = this.getFragmentedPath(image)
            const finalPath = this.IMG_DEST_PATH + path

            if (!existsSync(finalPath)) mkdirSync(finalPath)

            await rqImage(this.cookie, imagePath, finalPath + filename)
        }
    }

    getFragmentedPath(image) {
        const fullPath = image.split(/(\/)/)
        const filename = fullPath.pop()
        const path = fullPath.join('')

        return { path, filename }
    }

    joinNames(arr) {
        return (arr != null && arr.length) ? arr.map(a => a.name).join(', ') : ''
    }

    static async lookupEmail(email) {
        const domain = email.split('@')[1]
        const url = 'https://www.oreilly.com/member/auth/corporate/lookup/?domain=' + domain
        const res = await rq(url, null, 'GET')

        return res.body;
    }
}

module.exports = OBook