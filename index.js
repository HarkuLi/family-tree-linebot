"use strict"

const line = require("@line/bot-sdk");
const express = require("express");
const dbop = require("./dbop");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const app = express();

app.post("/webhook", line.middleware(config), (req, res)=>{
  Promise
    .all(req.body.events.map(handleEvent))
    .then((rst) => res.json(rst));
});

var handleEvent = (event)=>{
  if(event.type !== "message" || event.message.type !== "text"){
    return Promise.resolve(null);
  }

  var sourceId = event.source[event.source.type+"Id"];
  var colleName;
  
  dbop.getColleById(sourceId)
    .then(colle=>{
      colleName = colle;
      return cmdHandle(event, sourceId, event.message.text);
    });
  
  // const echo = {type: "text", text: event.message.text};

  // return client.replyMessage(event.replyToken, echo);
};

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
  console.log("listening on "+port);
});

/** function */
var cmdHandle = (event, srcId, msg) => {
  console.log(msg);
  return teach(event, msg)
    .then(rst => {
      if(rst) return true;
      return switchUsr(event, srcId, msg);
    })
    .then(rst => {
      return rst;
    })
};

/**
 * return true if the msg is a teaching command
 * and save the teaching content
 */
var teach = (event, msg) => {
  var idx_ps, idx_pe; //ps: pattern start, pe: pattern end
  var pattern, response;
  var rstFalse = Promise.resolve(false);

  msg = rmRedundantSpace(msg);
  //format: 瑪修我教你:[pattern]=>[response]
  //format checking
  if(msg.length < 10) return rstFalse;
  if(msg.substr(0, 5) !== "瑪修我教妳") return rstFalse;
  idx_ps = msg.indexOf(":", 5);
  if(idx_ps < 0 || idx_ps === msg.length-2) return rstFalse;
  ++idx_ps;
  idx_pe = msg.indexOf("=>", idx_ps+1);
  if(idx_pe < 0 || idx_pe === msg.length-3) return rstFalse;
  pattern = rmRedundantSpace(msg.slice(idx_ps, idx_pe));
  response = rmRedundantSpace(msg.slice(idx_pe+2));
  if(!pattern.length || !response.length) return rstFalse;
  //save in db and reply
  return dbop.resMapUpsert(pattern, response)
    .then(rst => {
      if(rst){
        const resMsg = {type: "text", text: "是, 我會記住的, 前輩(´▽｀)"}
        return client.replyMessage(event.replyToken, resMsg); //not sure
      }
      return false;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

/**
 * return true if the msg is a switching command
 * and save the id and collection mapping
 */
var switchUsr = (event, srcId, msg) => {
  var idx_ps; //ps: pattern start
  var usrName;
  var rstFalse = Promise.resolve(false);

  msg = rmRedundantSpace(msg);
  //format: #switch family: [user name]
  //format checking
  if(msg.length < 16) return rstFalse;
  if(msg.substr(0, 14) !== "#switch family")  return rstFalse;
  idx_ps = msg.indexOf(":", 14);
  if(idx_ps < 0 || idx_ps === msg.length-2) return rstFalse;
  ++idx_ps;
  usrName = rmRedundantSpace(msg.slice(idx_ps));
  if(!usrName.length) return rstFalse;
  //save the id and usr mapping
  return dbop.colleMapUpsert(srcId, usrName)
    .then(rst => {
      if(rst){
        const resMsg = {type: "text", text: ("已切換家庭資料庫, 使用者: "+usrName)}
        return client.replyMessage(event.replyToken, resMsg); //not sure
      }
      return false;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

var rmRedundantSpace = (str) => {
  if(!str.length)  return "";
  var idx_start, idx_end;
  var rst;
  for(idx_start=0; str[idx_start]===" "&&idx_start<str.length; ++idx_start){;}
  for(idx_end=str.length-1; str[idx_end]===" "&&idx_end>=0; --idx_end){;}
  ++idx_end;
  rst = str.slice(idx_start, idx_end);
  return rst;
};