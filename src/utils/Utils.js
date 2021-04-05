import { opmlToJSON } from 'opml-to-json';
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
    return opmlToJSON(xmlString)
}

export const objectToOpml = (header, outlines) => (opml(header, outlines))