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
        const resource = await this.download()
        this.assemble(resource)
    }

    async download() {
        if (!existsSync(DEST_PATH)) mkdirSync(DEST_PATH, { recursive: true })

        const meta = await client.fetch(this.bookUrl, this.cookie)
        this.validateFormat(meta.format)

        const title = meta.title
        const authors = meta.authors
        const publishers = meta.publishers
        const chapterUrls = meta.chapters
        const filename = this.buildFilename(title)
        const bookFolder = this.createBookFolder(filename)

        log(`downloading: ${title}`)
        log(`${chapterUrls.length} chapters to download, please wait...`)

        const coverUrl = await this.fetchCoverImageUrl(chapterUrls)
        const { chapters, contents } = await this.getChaptersAndContent(meta, bookFolder)

        const resource = this.buildResource(title, authors, publishers, coverUrl, bookFolder)
        const resourceWithContents = this.addContentToResource(
            resource,
            contents,
            chapters
        )
        return resourceWithContents
    }

    async getChaptersAndContent(meta, bookFolder) {
        const chapters = await this.fetchChapters(meta)
        const contents = await this.fetchContents(chapters)
        await this.downloadImages(chapters, bookFolder)
        return { chapters, contents }
    }

    async fetchChapters(meta) {
        meta.chapters.shift()
        const chapterUrls = meta.chapters
        return client.parallelFetch(chapterUrls, this.cookie)
    }

    async fetchContents(chapters) {
        const chapterContentUrls = chapters.map(ch => ch.content)
        return client.parallelFetch(chapterContentUrls, this.cookie)
    }

    async fetchCoverImageUrl(chapterUrls) {
        const coverUrl = bookImageUtils.findCoverElement(chapterUrls)
        const coverPage = await client.fetch(coverUrl, this.cookie)
        return this.findCoverImageUrl(coverPage.images)
    }

    buildResource(title, authors, publishers, coverUrl, bookFolder) {
        return {
            epub: {
                title,
                author: this.joinNames(authors),
                publisher: this.joinNames(publishers),
                cover: coverUrl,
                content: []
            },
            filename: this.buildFilename(title),
            folder: bookFolder
        }
    }

    createBookFolder(filename) {
        const folderPath = DEST_PATH + filename + '/'
        if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })

        return folderPath
    }

    buildFilename(title) {
        return title.toLowerCase().replace(/\s+/g, '-')
    }

    findCoverImageUrl(imagePaths) {
        const coverImagePath = bookImageUtils.findCoverElement(imagePaths)

        const fullPath = bookImageUtils.buildCoverFilePath(this.bookid, coverImagePath)
        return isUrl(fullPath) ? fullPath : undefined
    }

    assemble(resource) {
        log(`assembling book...`)
        new Epub(resource.epub, `${resource.folder}${resource.filename}.epub`).promise
            .then(
                () => {
                    if (existsSync(`${resource.folder}images`)) {
                        rmdirSync(`${resource.folder}images`, { recursive: true })
                        log(`done 📚✨`)
                    }
                },
                e => console.error("Error generating .epub ", e)
            )
    }

    addContentToResource(resource, contents, chapters) {
        for (let i = 0; i < contents.length; i++) {
            const chapter = chapters[i]
            const content = contents[i]

            const finalContent = this.replaceImagePaths(content, resource.folder)

            const chapterOptions = {
                title: chapter.title,
                author: this.joinNames(chapter.author),
                data: finalContent
            }
            resource.epub.content.push(chapterOptions)
        }
        return resource
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