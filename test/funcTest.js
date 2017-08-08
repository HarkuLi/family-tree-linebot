var isTeach = (msg) => {
  var idx_ps, idx_pe; //pe: pattern start, pe: pattern end
  var pattern, response;

  msg = rmRedundantSpace(msg);
  //format: 瑪修我教你:[pattern]=>[response]
  if(msg.length < 10) return false;
  if(msg.substr(0, 5) !== "瑪修我教妳") return false;
  idx_ps = msg.indexOf(":", 5);
  if(idx_ps < 0 || idx_ps === msg.length-2) return false;
  ++idx_ps;
  idx_pe = msg.indexOf("=>", idx_ps+1);
  if(idx_pe < 0 || idx_pe === msg.length-3) return false;
  pattern = rmRedundantSpace(msg.slice(idx_ps, idx_pe));
  response = rmRedundantSpace(msg.slice(idx_pe+2));
  if(!pattern.length || !response.length) return false;
  console.log("pattern: "+pattern+".");
  console.log("response: "+response+".");

  return true;
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

var msg = "uhfoeuhfq"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = ""
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = " "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "    "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = ":=>"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "::::::=>"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳:=>"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳   :    =>     "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳   :  1  =>     "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修 我教妳   :  1  =>  dd   "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳   :  1  =>  dd   "
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "瑪修我教妳:1=>dd"
console.log("msg: " + msg + ", rst: " + isTeach(msg));

msg = "     瑪修我教妳:1=>dd   "
console.log("msg: " + msg + ", rst: " + isTeach(msg));