import opmlToJSON from 'opml-to-json';
import opml from 'opml-generator'

export default {
    replaceXmlCharacter: raw => {
        return raw.replace(/&(lt|gt|quot|#xA);/g, function(a, b){
            return {
                lt: '<',
                gt: '>',
                quot: '"',
                '#xA': ' ', // newline
                '#x9': ' ', // TAB
                '#xD': ' ' // carriage-return
            }[b];
        })
    }
}

export const opmlToJson = xmlString => {
    return new Promise((resolve, reject) => {
        opmlToJSON(xmlString, (error, json) => {
            if (error) {
                reject()
            } else {
                resolve(json)
            }
        })
    })
}

export const objectToOpml = (header, outlines) => (opml(header, outlines))