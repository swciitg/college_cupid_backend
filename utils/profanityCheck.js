const {Filter} = require("bad-words");

exports.DetectToxicity = async (text) => {
    return false;
}

const censorWord = (word) => {
  if (word.length <= 2) {
    return '*'.repeat(word.length) 
  }
  return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1]
}

exports.RemoveBadWords = (text) => {
    const filter = new Filter();
    const cleanedText = text.split(' ')
                        .map(word => (filter.isProfane(word) ? censorWord(word) : word))
                        .join(' ');
    return cleanedText;
} 

