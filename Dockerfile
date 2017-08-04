FROM node:6

RUN npm install -g -y nodemon
RUN mkdir /linebot

WORKDIR /linebot
CMD ["npm", "run", "start"]
EXPOSE 3000