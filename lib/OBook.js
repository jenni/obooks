const { existsSync, mkdirSync, rmSync } = require('fs')
const cheerio = require('cheerio')
const Epub = require("epub-gen")
const url = require('url')
const path = require('path')
const async = require('async')

const { log, isUrl} = require('./utils')
const bookImageUtils = require('./book-image-utils')
const client = require('./client')

const OREILLY_API_BOOK_INFO_URL = 'https://learning.oreilly.com/api/v1/book'
const OREILLY_API_BOOK_URL = 'https://learning.oreilly.com/api/v2/epubs/urn:orm:book'
const DEST_PATH = path.dirname(require.main.filename) + '/books/'

class OBook {
    constructor(cookie, bookid) {
        this.cookie = cookie
        this.bookid = bookid
        this.infoUrl = `${OREILLY_API_BOOK_INFO_URL}/${bookid}`
        this.bookUrl = `${OREILLY_API_BOOK_URL}:${bookid}`    
    }

    async create() {
        if (!existsSync(DEST_PATH)) mkdirSync(DEST_PATH, { recursive: true })

        const info = await client.fetch(this.infoUrl, this.cookie)
        const meta = await client.fetch(this.bookUrl, this.cookie)

        this.validateFormat(meta.content_format)
        const title = meta.title
        const author = this.joinNames(info.authors)
        const publisher = this.joinNames(info.publishers)
        const filename = title.toLowerCase().replace(/\s+|[:?<>"]/g, '-')
        const bookFolder = this.createBookFolder(filename)
        const chapter = await client.fetch(meta.chapters, this.cookie)
        const cover = await this.fetchMaybeCoverImageUrl(chapter.results)

        chapter.results.shift()
        const chapters = chapter.results

        log(`downloading: ${title}`)
        log(`${chapters.length} chapters to download, please wait...`)

        const chapterContentUrls = chapters.map(ch => ch.content_url)
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
                        rmSync(`${bookFolder}images`, { recursive: true })
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
            const fullPath = String(coverUrl.related_assets.images)

            if (fullPath.length == 0)   {
                const altPath = String(coverUrl.related_assets.html_files).split('/').pop().replace(/\.[^\/.]+$/, '')
                const newPath = bookImageUtils.buildCoverFilePath(this.bookid, altPath)

                return isUrl(newPath) ? newPath : undefined
            }

            return isUrl(fullPath) ? fullPath : undefined
        }
    }

    async downloadImages(chapters, bookFolderPath) {
        for (let chapter of chapters) {
            const imagePaths = chapter.related_assets.images
            const assetBasetUrl = chapter.epub_archive

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
                    return client.downloadIMG({ url: imagePath, dest })
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