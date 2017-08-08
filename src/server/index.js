"use strict"

const line = require("@line/bot-sdk");
const express = require("express");
const dbop = require("../lib/dbop");
const dft = require("../config/default");

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
  
  //determine reponse database
  dbop.getColleById(sourceId)
    .then(colle => {
      colleName = colle;
      return cmdHandle(event, sourceId, event.message.text);
    })
    .then(rst => {
      if(rst) return true;
      return talkHandle(event, sourceId, event.message.text, colleName);
    });
};

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
  console.log("listening on "+port);
});

/** function */

/**
 * return a promise, and the result would be true if the message is a defined command
 */
var cmdHandle = (event, srcId, msg) => {
  return help(event, msg)
    .then(rst => {
      if(rst) return true;
      return teach(event, msg);
    })
    .then(rst => {
      if(rst) return true;
      return switchUsr(event, srcId, msg);
    })
    .then(rst =>{
      if(rst) return true;
      return talkToMashu(event, srcId, msg);
    });
};

/**
 * return a promise, and the result would be true if the bot responds
 */
var talkHandle = (event, srcId, msg, colleName) => {
  console.log("incoming message: " + msg);
  dbop.getResByMsg(msg, colleName)
    .then(resObj => {
      if(!resObj) return false;
      var text = "";
      var resMsg;
      if(resObj.talker) text += resObj.talker+": ";
      text += resObj.res;
      resMsg = {type: "text", text};
      return client.replyMessage(event.replyToken, resMsg);
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

/**
 * return a promise, and the result would be true if the message is a help command 
 */
var help = (event, msg) => {
  var rstFalse = Promise.resolve(false);

  msg = rmRedundantSpace(msg);
  //format: 瑪修,再講一次指令
  //format checking
  if(msg !== "瑪修,再講一次指令") return rstFalse;
  var text = "好~我再說一次(*´∀`):\n";
  text += "-----------------------------------------\n";
  text += "功能: 使用家庭回話資料庫\n";
  text += "指令: #switch family: [user name]\n";
  text += "-----------------------------------------\n";
  text += "功能: 跟我聊天(沒指定家庭回話資料庫的時候預設就是跟我對話唷(๑´ㅂ`๑))\n";
  text += "指令: 瑪修我想跟妳聊天\n";
  text += "-----------------------------------------\n";
  text += "功能: 教我講話~\n";
  text += "指令: 瑪修我教妳:[一段話]=>[回應]\n";
  text += "-----------------------------------------";
  const resMsg = {type: "text", text};

  return client.replyMessage(event.replyToken, resMsg)
    .then(() => {
      return true;
    });
};

/**
 * return a promise, and the result would be true if the message is a teaching command
 * and save the teaching content
 */
var teach = (event, msg) => {
  var idx_ps, idx_pe; //ps: pattern start, pe: pattern end
  var pattern, response;
  var rstTrue = Promise.resolve(true);
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
  if(idx_pe < 0 || idx_pe === msg.length-2) return rstFalse;
  pattern = rmRedundantSpace(msg.slice(idx_ps, idx_pe));
  response = rmRedundantSpace(msg.slice(idx_pe+2));
  if(!pattern.length || !response.length) return rstFalse;
  else if(pattern.length >= dft.MAX_INPUT_LEN || response >= dft.MAX_INPUT_LEN){
    const resMsg = {type: "text", text: "等...等等...前輩, 一次講太多了啦σ(oдolll)"}
    client.replyMessage(event.replyToken, resMsg);
    return rstTrue;
  }

  //save in db and reply
  return dbop.resMapUpsert(pattern, response)
    .then(rst => {
      if(rst){
        const resMsg = {type: "text", text: "是, 我會記住的, 前輩(´▽｀)"}
        return client.replyMessage(event.replyToken, resMsg);
      }
      return false;
    })
    .then(rst => {
      if(rst) return true;
      return false;
    });
};

/**
 * return a promise, and the result would be true if the message is a switching command
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
        const resMsg = {type: "text", text: ("已切換家庭資料庫, 使用者: "+usrName)};
        return client.replyMessage(event.replyToken, resMsg)
          .then(() => true);
      }
      const resMsg = {type: "text", text: ("抱歉, 找不到這個家族使用者名稱【o´ﾟ□ﾟ`o】")};
      return client.replyMessage(event.replyToken, resMsg)
        .then(() => false);
    });
};

/**
 * return a promise, and the result would be true if the message is a talking to mashu command
 * and reset the id and collection mapping
 */
var talkToMashu = (event, srcId, msg) => {
  var rstFalse = Promise.resolve(false);

  msg = rmRedundantSpace(msg);
  //format: 瑪修我想跟妳聊天
  //format checking
  if(msg !== "瑪修我想跟妳聊天") return rstFalse;
  
  //remove the id and usr mapping
  return dbop.colleMapDelete(srcId)
    .then(() => {
      const resMsg = {type: "text", text: ("好啊, 前輩~我們要聊什麼呢?(*≧∇≦*)")};
      return client.replyMessage(event.replyToken, resMsg);
    })
    .then(() => {
      return true;
    });
}

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