const CoverImageUtils = require('../lib/cover-image-utils')

test(`Should find cover element in chapters with 'cover' keyword`, async () => {
    const expected = "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/cover.html"
    const chapters = [
        expected,
        "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/titlepage01.html",
        "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/copyright-page01.html"
    ]
    const result = CoverImageUtils.findCoverElement(chapters)
    expect(result).toBe(expected)
})

test(`Should find cover element in chapters with 'titlepage' keyword`, async () => {
    const expected = "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/titlepage01.html"
    const chapters = [
        expected,
        "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/copyright-page01.html",
        "https://learning.oreilly.com/api/v1/book/9781492034018/chapter/preface01.html"
    ]
    const result = CoverImageUtils.findCoverElement(chapters)
    expect(result).toBe(expected)
})

test(`Should find cover element in images list with 'cover' keyword`, async () => {
    const expected = "assets/cover.png"
    const images = [
        expected,
        "assets/stamp.jpg"
    ];
    const coverEl = CoverImageUtils.findCoverElement(images)
    expect(coverEl).toBe("assets/cover.png")
})

test(`Should build cover filepath`, async () => {
    const expected = "https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781492034018/files/assets/cover.png"
    const result = CoverImageUtils.buildCoverFilePath('9781492034018', 'assets/cover.png')
    expect(result).toBe(expected)
})

test(`Should return undefined cover filepath`, async () => {
    const result1 = CoverImageUtils.buildCoverFilePath('123', undefined)
    const result2 = CoverImageUtils.buildCoverFilePath(undefined, 'lsd/is/good')
    const result3 = CoverImageUtils.buildCoverFilePath(undefined, undefined)

    expect(result1).toBe(undefined)
    expect(result2).toBe(undefined)
    expect(result3).toBe(undefined)
})
