# Build shared module
FROM node:12-alpine

WORKDIR /app/cshub-shared

COPY . .

RUN yarn install && yarn cache clean
