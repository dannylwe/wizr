FROM node:12-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update -y
RUN apt-get install libpoppler-dev poppler-utils unoconv libreoffice ghostscript ghostscript git curl
RUN apt-get install -y python3.9

EXPOSE 3000

RUN npm run start
