const MIN_PAT_SIM = process.env.MIN_PAT_SIM || 0.7; //minimum pattern similarity
const MIN_WORD_SIM = process.env.MIN_WORD_SIM || 0.78; //minimum word similarity

module.exports = {
  MIN_PAT_SIM,
  MIN_WORD_SIM,
  //max length of teached pattern and response
  MAX_INPUT_LEN: 500
};