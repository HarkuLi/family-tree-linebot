var MongoClient = require('mongodb').MongoClient;

const dbUrl = "mongodb://mongodb.harkuli.nctu.me:27017/linebot";

const getDb = MongoClient.connect(dbUrl);
const colleIcm = "idColleMap";
const defaultColle = "mashu";

/**
 * return collection name correspond to source id
 * return mashu by default
 */
var getColleById = (srcId)=>{
  var colleName = defaultColle;
  return getDb
    .then(db => {
      var colle = db.collection("colleIcm");
      colle.findOne({srcId});
    })
    .then(item => {
      if(item) colleName = item.colleName;
      return colleName;
    });
};

/** operation of response mapping collection */
var resMapUpdate = (pattern, response, colleName) => {
  var colleName = colleName || defaultColle;
  var colle;
  return getDb
    .then(db=>{
      colle = db.collection(colleName);
      return colle.updateOne({pattern}, {$set: {response}});
    })
    .then(rst=>{
      if(!rst.matchedCount) return colle.insertOne({pattern, response});
      return null;
    })
};

var getResByPattern = (pattern, colleName) => {
  var colleName = colleName || defaultColle;
};

/** private functions */
var isMatch = (pattern, msg) => {

};

module.exports = {defaultColle, getColleById, resMapUpdate};