# Family-tree-linebot

A linebot that should co-work with [family_tree](https://github.com/HarkuLi/family_tree) project.

Two modes:

* family tree assistant: using response collection of family
* chat: using her own response collection

## Add the bot(マシュ) as a line friend

Line ID: @zjz2485k

QR code:

<img src="https://github.com/HarkuLi/family-tree-linebot/blob/master/img/linebot_QRcode.png?raw=true">

## Commands of the bot

### See the commands list
  
command: 瑪修,再講一次指令
  
### Use response collection of a family

command: #switch family: [user name]

ex: #switch family: user1

### Chat to the bot

command: 瑪修我想跟妳聊天

### Teach the bot

command: 瑪修我教妳:[pattern]=>[response]

ex: 瑪修我教妳: weather => sunny day

## Similar pattern also works

<img src="https://github.com/HarkuLi/family-tree-linebot/blob/master/img/similarity_demo.jpg?raw=true">

## Environment variables

### Required

* CHANNEL_ACCESS_TOKEN: for line API

* CHANNEL_SECRET: for line API

### Not required if running locally

* DB_URL: URL of remote db ex: mongodb://mydb.xxx.xxx:27017/

* USER_FT: user name of familytree db account

* PWD_FT: password of familytree db account

* USER_LB: user name of linebot db account

* PWD_LB: password of linebot db account

### Not required

* MIN_WORD_SIM: parameter for comparing similarity

* MIN_PAT_SIM: parameter for comparing similarity

## Get started

Note: you should run mongodb in [family_tree](https://github.com/HarkuLi/family_tree) project first, either locally or remotely

build docker image by Dockerfile

	npm run build-dev

### Running db locally

	npm run start-docker-localdb
	
now, your server run on localhost:3000

### Running db remotely
	
first, write the url and authentication info. in the .env file

and run:

	npm run start-docker-remotedb
	
now, your server run on localhost:3000