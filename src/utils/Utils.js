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