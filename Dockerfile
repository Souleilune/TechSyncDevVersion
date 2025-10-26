FROM node:22-alpine

# app dir
WORKDIR /frontend/app

# copy app package
COPY package*.json ./

#local directory
COPY ./src ./src
COPY ./public ./public

#install node packages
#RUN npm install

EXPOSE 3000

