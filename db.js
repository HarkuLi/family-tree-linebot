const MongoClient = require('mongodb').MongoClient;

const serverUrl = "mongodb://mongodb.harkuli.nctu.me:27017";
const dbUrl_lb = serverUrl + "/linebot";
const dbUrl_ft = serverUrl + "/familytree";

const getDb_lb = MongoClient.connect(dbUrl_lb);
const getDb_ft = MongoClient.connect(dbUrl_ft);

module.exports = {getDb_lb, getDb_ft};