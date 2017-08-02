const MongoClient = require('mongodb').MongoClient;

const user_ft = process.env.USER_FT;
const pwd_ft = process.env.PWD_FT;
const user_lb = process.env.USER_LB;
const pwd_lb = process.env.PWD_LB;

const dbUrl_lb = "mongodb://" + user_lb + ":" + pwd_lb + "@mongodb.harkuli.nctu.me:27017/linebot";
const dbUrl_ft = "mongodb://" + user_ft + ":" + pwd_ft + "@mongodb.harkuli.nctu.me:27017/familytree";

const getDb_lb = MongoClient.connect(dbUrl_lb);
const getDb_ft = MongoClient.connect(dbUrl_ft);

module.exports = {getDb_lb, getDb_ft};