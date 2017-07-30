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
      if(item) colleName = "usr_"+item.usr;
      return colleName;
    });
};

var colleMapUpsert = (srcId, usr) =>{
  var colle;

  return getFtDb
    .then(db => {
      colle = db.collection("user");
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

var colleMapDelete = (srcId) =>{
  return getDb
    .then(db => {
      var colle = db.collection(colleIcm);
      return colle.deleteOne({srcId});
    });
}

/**
 * operation of response mapping collection
 */

/**
 * required parameters: pattern, response
 */
var resMapUpsert = (pattern, response, colleName, talker, talkerId) => {
  var colleName = colleName || defaultColle;
  var colle;
  return getDb
    .then(db => {
      var reqObj = {pattern};
      if(talker && talkerId)  reqObj.talkerId = talkerId;
      colle = db.collection(colleName);
      return colle.updateOne(reqObj, {$set: {response}});
    })
    .then(rst => {
      if(!rst.matchedCount){
        var insertObj = {pattern, response};
        if(talker && talkerId){
          insertObj.talker = talker;
          insertObj.talkerId = talkerId;
        }
        return colle.insertOne(insertObj);
      }
      return true;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

/**
 * return a random response of the matched response list correspond to the message
 * return object: {res, talker}
 */
var getResByMsg = (msg, colleName) => {
  var colleName = colleName || defaultColle;
  var colle;

  return getDb
    .then(db => {
      var stream;
      colle = db.collection(colleName);
      stream = colle.find().stream();
      return new Promise((resolve) => {
        var rst = [];

        stream.on("end", () => {
          resolve(rst);
        });

        stream.on("data", (data)=>{
          if(isMatch(data.pattern, msg)){
            let newObj = {res: data.response, talker: data.talker};
            rst.push(newObj);
          }
        })
      });
    })
    .then(resList => {
      if(!resList.length) return null;
      var idx = Math.floor(Math.random()*resList.length);
      return resList[idx];
    });
};

/** private functions */
var isMatch = (pattern, msg) => {
  return pattern === msg;
};

module.exports = {getColleById, colleMapUpsert, colleMapDelete, resMapUpsert, getResByMsg};