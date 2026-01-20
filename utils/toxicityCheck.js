const {Filter} = require("bad-words");

exports.DetectToxicity = async (text) => {
    return true;
}

exports.RemoveBadWords = (text) => {
    const filter = new Filter();
    const cleanedText = filter.clean(text);
    return cleanedText;
} 

