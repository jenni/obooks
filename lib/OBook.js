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
    }

    async create() {
        if (!existsSync(this.IMG_DEST_PATH)) mkdirSync(this.IMG_DEST_PATH)
        if (!existsSync(this.EBOOK_DEST_PATH)) mkdirSync(this.EBOOK_DEST_PATH)

        // @todo throw exception if format is not book

        const meta = await this.fetch(this.baseUrl)
        const title = meta.title
        const author = this.joinNames(meta.authors)
        const publisher = this.joinNames(meta.publishers)
        const cover = await this.fetchCoverImagePath(meta.chapters)

        const options = { title, author, publisher, cover, content: [] }

        meta.chapters.shift()
        const chapterUrls = meta.chapters
        log(`Getting:: ${title} ...`)
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
            log(`Done downloading chapter: ${chapter.title}`)
        }

        const filename = title.toLowerCase().replace(/\s+/g, '-')
        new Epub(options, `${this.EBOOK_DEST_PATH}/${filename}.epub`)
    }

    async fetch(url) {
        const res = await rq(url, this.cookie, 'GET')
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
            .length ? cover[0] :
                images.length === 1 ? images[0] : null
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
            try {
                await rqImage(this.cookie, imagePath, finalPath + filename)
            } catch(e) {
                log(`[Obook::downloadChapterImages] there was an error downloading the image ${imagePath} e: ${e}`)
            }
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
        const url = 'https://www.oreilly.com/member/auth/corporate/lookup/'
        const body = { domain }

        try {
            const res = await rq(url, null, 'POST', body)
            return res.body;
        } catch(e) {
            console.log('[OBook::lookupEmail] There was an error during email lookup ', e)
            process.exit(1)
        }
    }
}

module.exports = OBook