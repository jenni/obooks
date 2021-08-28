function findCoverElement(listOfStrings) {
    const coverImageKeywords = ['cover', 'titlepage']
    return listOfStrings.find(list => coverImageKeywords.some(keyword => list.includes(keyword)))
}

function buildCoverFilePath(bookId,
                            coverPath) {
    if (bookId !== undefined && coverPath !== undefined) {
        return `https://learning.oreilly.com/api/v2/epubs/urn:orm:book:${bookId}/files/${coverPath}`
    }
}

module.exports = {
    findCoverElement,
    buildCoverFilePath
}
