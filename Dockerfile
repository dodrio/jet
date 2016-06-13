FROM node:6.2.1

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm --registry=https://registry.npm.taobao.org install

COPY . /usr/src/app

EXPOSE 9527
CMD [ "npm", "start" ]
