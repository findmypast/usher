FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY publish.sh .

RUN npm set progress=false && npm install

COPY . /usr/src/app
