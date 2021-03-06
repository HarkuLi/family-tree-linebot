const Mongo = require('mongodb'); //for ObjectId()
const dbConnect = require("./db");
const match = require("./match");
const dft = require("../config/default");

const colleIcm = "idColleMap";
const defaultColle = "mashu";

////////////////////
//public functions
////////////////////

/**
 * return collection name correspond to source id
 * return mashu by default
 */
var getColleById = (srcId)=>{
  var colleName = defaultColle;
  return dbConnect.getDb_lb
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

  return dbConnect.getDb_ft
    .then(db => {
      colle = db.collection("user");
      return colle.count({usr});
    })
    .then(count => {
      if(!count) return false;
      return dbConnect.getDb_lb;
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
  return dbConnect.getDb_lb
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
  return dbConnect.getDb_lb
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
 * return object: {res, talker} or null
 */
var getResByMsg = (msg, colleName) => {
  var colleName = colleName || defaultColle;
  var colle;
  var resObj;
  var max_weight = 0;

  return dbConnect.getDb_lb
    .then(db => {
      var stream;
      var filter = colleName === defaultColle ? {} : {enable: true};
      colle = db.collection(colleName);
      stream = colle.find(filter).stream();
      return new Promise((resolve) => {
        var rst = [];

        stream.on("end", () => {
          resolve(rst);
        });

        stream.on("data", (data)=>{
          var sim_rst = match.pattern_similarity(data.pattern, msg);
          //record response while the similarity weight isn't small then current max weight
          //where weight is the matched split part number between the pattern and message
          if(sim_rst.sim >= dft.MIN_PAT_SIM && sim_rst.weight >= max_weight){
            let newObj = {
              res: data.response,
              talkerId: data.talkerId,
              weight: sim_rst.weight
            };
            rst.push(newObj);
            max_weight = sim_rst.weight;
          }
        });
      });
    })
    .then(resList => {
      if(!resList.length){
        resObj = null;
        console.log("the response list is null");
        return false;
      }
      resList = pickResByWeight(resList, max_weight);
      var idx = Math.floor(Math.random()*resList.length);
      resObj = resList[idx];
      if(!resObj.talkerId)  return false;
      return getNameById(resObj.talkerId);
    })
    .then(talker => {
      if(talker){
        delete resObj.talkerId;
        resObj.talker = talker;
      }
      return resObj;
    });
};

////////////////////
//private functions
////////////////////

/**
 * get talker name by talker id
 * @param {String} talkerId talker id
 * @return {Promise} resolved value is talker name
 */
var getNameById = (talkerId) => {
  return dbConnect.getDb_ft
    .then(db => {
      var colle = db.collection("person");
      return colle.findOne({_id: Mongo.ObjectId(talkerId)});
    })
    .then(item => {
      return item.name;
    });
};

/**
 * return an array of response objects with designated weight
 * @param {*} resArr response array
 * @param {*} weight designated weight
 * @return {Array<Object>} an array of response objects
 */
var pickResByWeight = (resArr, weight) => {
  var rst = [];
  for(let res of resArr){
    if(res.weight === weight){
      console.log("pick a response: " + JSON.stringify(res));
      rst.push(res);
    }
  }
  return rst;
};

module.exports = {getColleById, colleMapUpsert, colleMapDelete, resMapUpsert, getResByMsg};