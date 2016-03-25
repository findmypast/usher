FROM node:5.9.1

RUN npm config set registry http://npm-mirror.dun.fh:2020/
RUN npm set progress=false
