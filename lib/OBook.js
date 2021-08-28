const { existsSync, mkdirSync, unlinkSync, rmdirSync } = require('fs')
const cheerio = require('cheerio')
const Epub = require("epub-gen")
const url = require('url')
const path = require('path')

const { req, log, downloadIMG, isUrl} = require('./utils')
const CoverImageUtils = require('./cover-image-utils')

const OREILLY_API_BOOK_URL = 'https://learning.oreilly.com/api/v1/book'
const DEST_PATH = path.dirname(require.main.filename) + '/books/'
const UNAUTHORISED_CODE = 401

class OBook {
    constructor(cookie, bookid) {
        this.cookie = cookie
        this.bookid = bookid
        this.bookUrl = `${OREILLY_API_BOOK_URL}/${bookid}`
    }

    async create() {
        if (!existsSync(DEST_PATH)) mkdirSync(DEST_PATH, { recursive: true })

        const meta = await this.fetch(this.bookUrl)
        this.validateFormat(meta.format)

        const title = meta.title
        const author = this.joinNames(meta.authors)
        const publisher = this.joinNames(meta.publishers)
        const cover = await this.fetchMaybeCoverImageUrl(meta.chapters)
        const filename = title.toLowerCase().replace(/\s+/g, '-')
        const bookFolder = this.createBookFolder(filename)

        meta.chapters.shift()
        const chapterUrls = meta.chapters
        
        log(`downloading: ${title}`)
        log(`${chapterUrls.length} chapters to download, this can take a while...`)

        const epubOpts = {
            title,
            author,
            publisher,
            cover,
            content: []
        }
        for (const chapterUrl of chapterUrls) {
            const chapter = await this.fetch(chapterUrl)
            const content = await this.fetch(chapter.content)
            const finalContent = this.replaceImagePaths(content, bookFolder)

            await this.downloadChapterImages(chapter, bookFolder)

            const chapterOptions = {
                title: chapter.title,
                author: this.joinNames(chapter.author),
                data: finalContent
            }
            epubOpts.content.push(chapterOptions)
            log(`done downloading chapter: ${chapter.title}`)
        }

        new Epub(epubOpts, `${bookFolder}${filename}.epub`).promise
            .then(
                () => {
                    if (existsSync(`${bookFolder}images`)) {
                        log(`removing temp files..`)
                        rmdirSync(`${bookFolder}images`, { recursive: true })
                        log(`done 📚✨`)
                    }
                },
                e => console.error("Error generating .epub ", e)
            )
    }

    createBookFolder(bookTitle) {
        const folderPath = DEST_PATH + bookTitle + '/'
        if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })

        return folderPath
    }

    validateFormat(format) {
        if (format !== 'book') {
            log(`${format} format not supported.`)
            process.exit(1)
        }
    }

    replaceImagePaths(content, bookFolder) {
        const $ = cheerio.load(content)
        $('img').each(function (i, image) {
            const oldSrc = $(image).attr('src')
            const newSrc = oldSrc.split('/').pop()

            $(this).attr('src', newSrc)
        })

        return $.html()
            .replace(/src="/g, `src="${url.pathToFileURL(bookFolder).href + 'images/'}`)
    }

    async fetch(url) {
        try {
            const res = await req('GET', url, this.cookie, null)
            return res.body
        } catch (e) {
            if (e.statusCode === UNAUTHORISED_CODE) {
                const cookiesPath = __dirname + '/../' + 'session.json'
                if (existsSync(cookiesPath)) {
                    unlinkSync(cookiesPath)
                }
                log(`...cookies expired, try again passing the -c <cookie> flag`)
                process.exit(1)
            }
            console.log(e)
            process.exit(1)
        }
    }

    async fetchMaybeCoverImageUrl(chapters) {
        const coverUrl = CoverImageUtils.findCoverElement(chapters)

        if (coverUrl !== undefined) {
            const coverPage = await this.fetch(coverUrl, this.cookie, 'GET')
            const coverImagePath = CoverImageUtils.findCoverElement(coverPage.images)

            const fullPath = CoverImageUtils.buildCoverFilePath(this.bookid, coverImagePath)
            return isUrl(fullPath) ? fullPath : undefined
        }
    }

    async downloadChapterImages(chapter, bookFolder) {
        const assetBaseUrl = chapter.asset_base_url
        const images = chapter.images
        const imagesFolder = bookFolder + 'images/'

        if (!images.length) return

        for (const image of images) {
            const imageFilename = image.split('/').pop()
            const dest = imagesFolder + imageFilename

            if (!existsSync(imagesFolder)) {
                mkdirSync(imagesFolder, { recursive: true })
            }
            const oReillyImageUrl = assetBaseUrl + image
            await downloadIMG({ url: oReillyImageUrl, dest })
        }
    }

    joinNames(arr) {
        return (arr != null && arr.length)
            ? arr.map(a => a.name).join(', ')
            : ''
    }
}

module.exports = OBook