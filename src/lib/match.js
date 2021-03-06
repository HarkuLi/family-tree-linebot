const nodejieba = require("nodejieba");
const dft = require("../config/default");

// nodejieba.load({
//   userDict: "../../dict/dict.txt"
// });

var last_pat = "";
var last_pat_cut = [];

/**
 * suppose that pattern length: N, sentence length: M
 * @param {String} pattern
 * @param {String} sentence 
 * @return {Number} similarity
 */
var pattern_similarity = (pattern, sentence) => {
  var chRE = /[\u4E00-\u9FA5]/; //chinese unicode
  var pat_arr, sent_arr;  //split pattern, split sentence

  //split pattern
  //avoid repeated splitting same pattern
  if(pattern === last_pat)  pat_arr = last_pat_cut;
  else{
    pattern = pattern.toLowerCase();
    pat_arr = chRE.test(pattern) ? nodejieba.cut(pattern) : pattern.split(" ");
    last_pat = pattern;
    last_pat_cut = pat_arr;
  }

  //split sentence 
  sentence = sentence.toLowerCase();
  sent_arr = chRE.test(sentence) ? nodejieba.cut(sentence) : sentence.split(" ");

  return split_similarity(pat_arr, sent_arr);
};

/**
 * suppose that str1 length: N, str2 length: M
 * complexity: Θ(N*M)
 * @param {String} str1
 * @param {String} str2
 * @return {Number} similarity
 */
var str_similarity = (str1, str2) => {
  if(!str1.length || !str2.length) return 0;
  var DPTable = []; //dynamic programming table
  var upper_left_tmp;
  var upper_left = 0;
  var max_len = max(str1.length, str2.length);
  var LCS_len;
  //the index of dynamic programming table start from 1 for programming easily
  //note that indices of str1 and str2 still start from 0
  for(let i=0; i<=max_len; ++i) DPTable[i] = 0;  //complexity: Θ(max(N, M))

  //complexity: Θ(N*M)
  for(let i=1; i<=str1.length; ++i){
    for(let j=1; j<=str2.length; ++j){
      upper_left_tmp = DPTable[j];
      if(str1[i-1] === str2[j-1])
        DPTable[j] = upper_left + 1;
      else
        DPTable[j] = max(DPTable[j-1], DPTable[j]);
      upper_left = upper_left_tmp;
    }
    upper_left = 0;
  }
  LCS_len = DPTable[str2.length];
  return LCS_len / max_len;
};

/**
 * determine how much the sentence match the pattern
 * suppose that the pattern total length: N, the sentence total length: M
 * complexity: Θ(N*M)
 * @param {Array<String>} pat_arr array of split pattern
 * @param {Array<String>} sent_arr array of split sentence
 * @return {Object} {similarity, weight}, where weight is the matched split part number between the pattern and sentence
 */
var split_similarity = (pat_arr, sent_arr) => {
  if(!pat_arr.length || !sent_arr.length) return 0;
  var DPTable = []; //dynamic programming table
  var upper_left_tmp;
  var upper_left = 0;
  var max_len = max(pat_arr.length, sent_arr.length);
  var LCS_len;
  var sim;
  //the index of dynamic programming table start from 1 for programming easily
  //note that indices of pat_arr and sent_arr still start from 0
  for(let i=0; i<=max_len; ++i) DPTable[i] = 0;  //complexity: Θ(max(N, M))

  //complexity: Θ(N*M)
  for(let i=1; i<=pat_arr.length; ++i){
    for(let j=1; j<=sent_arr.length; ++j){
      upper_left_tmp = DPTable[j];
      //small different with LCS, use similarity between words instead of equality
      if(str_similarity(pat_arr[i-1],sent_arr[j-1]) >= dft.MIN_WORD_SIM)
        DPTable[j] = upper_left + 1;
      else
        DPTable[j] = max(DPTable[j-1], DPTable[j]);
      upper_left = upper_left_tmp;
    }
  }
  LCS_len = DPTable[sent_arr.length];

  sim = LCS_len/pat_arr.length;
  if(sim >= dft.MIN_PAT_SIM){
    console.log("cut pattern: " + JSON.stringify(pat_arr));
    console.log("cut sentence: " + JSON.stringify(sent_arr));
  }

  return {sim, weight: LCS_len};
}

var max = (num1, num2) => {
  return num1 > num2 ? num1 : num2;
};

module.exports = {pattern_similarity};