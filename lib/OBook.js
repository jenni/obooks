const { existsSync, mkdirSync, rmdirSync } = require('fs')
const cheerio = require('cheerio')
const Epub = require("epub-gen")
const url = require('url')
const path = require('path')
const async = require('async')

const { log, isUrl} = require('./utils')
const bookImageUtils = require('./book-image-utils')
const client = require('./client')

const OREILLY_API_BOOK_URL = 'https://learning.oreilly.com/api/v1/book'
const DEST_PATH = path.dirname(require.main.filename) + '/books/'

class OBook {
    constructor(cookie, bookid) {
        this.cookie = cookie
        this.bookid = bookid
        this.bookUrl = `${OREILLY_API_BOOK_URL}/${bookid}`
    }

    async create() {
        if (!existsSync(DEST_PATH)) mkdirSync(DEST_PATH, { recursive: true })

        const meta = await client.fetch(this.bookUrl, this.cookie)
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
        log(`${chapterUrls.length} chapters to download, please wait...`)

        const chapters = await client.parallelFetch(chapterUrls, this.cookie)
        const chapterContentUrls = chapters.map(ch => ch.content)
        const contents = await client.parallelFetch(chapterContentUrls, this.cookie)
        await this.downloadImages(chapters, bookFolder)

        const epubOpts = this.buildEpubOpts(
            { title, author, publisher, cover, content: [] },
            bookFolder,
            contents,
            chapters
        )

        log(`assembling book...`)
        new Epub(epubOpts, `${bookFolder}${filename}.epub`).promise
            .then(
                () => {
                    if (existsSync(`${bookFolder}images`)) {
                        rmdirSync(`${bookFolder}images`, { recursive: true })
                        log(`done 📚✨`)
                    }
                },
                e => console.error("Error generating .epub ", e)
            )
    }

    buildEpubOpts(epubOpts, bookFolder, contents, chapters) {
        for (let i = 0; i < contents.length; i++) {
            const chapter = chapters[i]
            const content = contents[i]

            const finalContent = this.replaceImagePaths(content, bookFolder)

            const chapterOptions = {
                title: chapter.title,
                author: this.joinNames(chapter.author),
                data: finalContent
            }
            epubOpts.content.push(chapterOptions)
        }
        return epubOpts
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

    async fetchMaybeCoverImageUrl(chapters) {
        const coverUrl = bookImageUtils.findCoverElement(chapters)

        if (coverUrl !== undefined) {
            const coverPage = await client.fetch(coverUrl, this.cookie)
            const coverImagePath = bookImageUtils.findCoverElement(coverPage.images)

            const fullPath = bookImageUtils.buildCoverFilePath(this.bookid, coverImagePath)
            return isUrl(fullPath) ? fullPath : undefined
        }
    }

    async downloadImages(chapters, bookFolderPath) {
        for (let chapter of chapters) {
            const imagePaths = chapter.images
            const assetBasetUrl = chapter.asset_base_url
            if (imagePaths.length || isUrl(assetBasetUrl)) {
                await this.parallelDownloadImages(
                    imagePaths,
                    assetBasetUrl,
                    bookImageUtils.getLocalImagesPath(bookFolderPath)
                )
            }
        }
    }

    async parallelDownloadImages(imagePaths, assetBaseUrl, localImagesPath) {
        try {
            const requests = imagePaths.map(imagePath => {
                return async function () {
                    const localImageName = imagePath.split('/').pop()
                    const dest = localImagesPath + localImageName

                    if (!existsSync(localImagesPath)) {
                        mkdirSync(localImagesPath, { recursive: true })
                    }
                    const oReillyImageUrl = assetBaseUrl + imagePath;
                    return client.downloadIMG({ url: oReillyImageUrl, dest })
                }
            })
            return async.parallel(requests)
        } catch (e) {
            console.error(e)
            process.exit(1)
        }
    }

    joinNames(arr) {
        return (arr != null && arr.length)
            ? arr.map(a => a.name).join(', ')
            : ''
    }
}

module.exports = OBook