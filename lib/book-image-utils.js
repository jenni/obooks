function findCoverElement(listOfStrings) {
    const coverImageKeywords = ['cover', 'titlepage']
    const coverPages = listOfStrings.filter(list => coverImageKeywords.some(keyword => list.reference_id.toLowerCase().includes(keyword)));
    // Return first cover page identified
    if (coverPages.length > 0) {
      return coverPages[0];
    }
    return null;
}

// This will need to change, as some books use the graphics endpoint (/api/v2/epubs/urn:orm:book:${bookId}/files/graphics/${coverPath})
// Not currently in use in this iteration
function buildCoverFilePath(bookId,
                            coverPath) {
    if (bookId !== undefined && coverPath !== undefined) {
        return `https://learning.oreilly.com/api/v2/epubs/urn:orm:book:${bookId}/files/${coverPath}`
    }
}

function getLocalImagesPath(bookFolderPath) {
    return `${bookFolderPath}images/`
}

module.exports = {
    findCoverElement,
    buildCoverFilePath,
    getLocalImagesPath
}
