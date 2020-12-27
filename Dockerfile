FROM node:12.20.0-alpine3.11

WORKDIR /usr/app

COPY lib lib
COPY cli.js cli.js
COPY package-lock.json package-lock.json
COPY package.json package.json

RUN npm install

ENTRYPOINT ["./cli.js"]