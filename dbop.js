var MongoClient = require('mongodb').MongoClient;

const dbUrl = "mongodb://mongodb.harkuli.nctu.me:27017/linebot";
const dbUrl_familytree = "mongodb://mongodb.harkuli.nctu.me:27017/familytree";

const getDb = MongoClient.connect(dbUrl);
const getFtDb = MongoClient.connect(dbUrl_familytree);
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
      var colle = db.collection(colleIcm);
      return colle.findOne({srcId});
    })
    .then(item => {
      if(item) colleName = item.colleName;
      return colleName;
    });
};

var colleMapUpsert = (srcId, usr) =>{
  var colle;

  return getFtDb
    .then(db => {
      var colle = db.collection("user");
      return colle.count({usr});
    })
    .then(count => {
      if(!count) return false;
      return getDb;
    })
    .then(db => {
      if(!db) return false;
      colle = db.collection(colleIcm);
      return colle.updateOne({srcId}, {$set: {usr}});
    })
    .then(rst => {
      if(!rst)  return false;
      if(!rst.matchedCount) return colle.insertOne({srcId, usr});
      return true;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
}

/** operation of response mapping collection */
var resMapUpsert = (pattern, response, colleName) => {
  var colleName = colleName || defaultColle;
  var colle;
  return getDb
    .then(db => {
      colle = db.collection(colleName);
      return colle.updateOne({pattern}, {$set: {response}});
    })
    .then(rst => {
      if(!rst.matchedCount) return colle.insertOne({pattern, response});
      return true;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

var getResByPattern = (pattern, colleName) => {
  var colleName = colleName || defaultColle;
};

/** private functions */
var isMatch = (pattern, msg) => {

};

module.exports = {defaultColle, getColleById, colleMapUpsert, resMapUpsert};