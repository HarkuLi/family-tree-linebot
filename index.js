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
  var isTeach = false;
  
  dbop.getColleById(sourceId)
    .then(colle=>{
      colleName = colle;
      return cmdHandle(event.message.text);
    });
  
  const echo = {type: "text", text: event.message.text};

  return client.replyMessage(event.replyToken, echo);
};

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
  console.log("listening on "+port);
});

/** function */
var cmdHandle = (msg) => {
  
};

var isTeach = (msg) => {
  var idx_ps, idx_pe; //pe: pattern start, pe: pattern end
  var pattern, response;

  msg = rmRedundantSpace(msg);
  //format: 瑪修我教你:[pattern]=>[response]
  //format checking
  if(msg.length < 10) return false;
  if(msg.substr(0, 5) !== "瑪修我教妳") return false;
  idx_ps = msg.indexOf(":", 5);
  if(idx_ps < 0 || idx_ps === msg.length-1) return false;
  idx_pe = msg.indexOf("=>", idx_ps+1);
  if(idx_pe < 0 || idx_pe === msg.length-2) return false;
  pattern = rmRedundantSpace(msg.slice(idx_ps, idx_pe));
  response = rmRedundantSpace(msg.slice(idx_pe+2));
  if(!pattern.length || !response.length) return false;
  dbop.resMapUpdate(pattern, response);
  //save in db

  return true;
};

var rmRedundantSpace = (str) => {
  if(!str.length)  return "";
  var idx_start, idx_end;
  var rst;
  for(idx_start=0; msg[idx_start]===" "&&idx_start<str.length; ++idx_start){;}
  for(idx_end=str.length-1; msg[idx_end]===" "&&idx_end>=0; --idx_end){;}
  ++idx_end;
  rst = str.slice(idx_start, idx_end);
  return rst;
};