// import { Filter } from "bad-words";
const { FilterBadWord } = require('badfilter-js');

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
    // const filter = new Filter();
    // const cleanedText = text.split(' ')
    //                     .map(word => (filter.isProfane(word) ? censorWord(word) : word))
    //                     .join(' ');
    // return cleanedText;

    // const filter = new filters_badword();
    // filter.config(true, true, "dict|kick|chicky", "stupid|badly");
    // filter.text_o(text);
    // cleanedText = filter.cleans; 
    // return cleanedText;

    const filter = new FilterBadWord(text , process.env.BAD_WORDS_ADDITIONS);
    const cleanedText = filter.clean();
    return cleanedText;
} 

