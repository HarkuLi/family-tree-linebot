const match = require("../src/lib/match");

var sim = match.pattern_similarity("嗨...", "https://www.google.com.tw/");

console.log(sim);