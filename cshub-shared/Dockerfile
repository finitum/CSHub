# Build shared module
FROM node:11-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/cshub-shared

COPY . .

RUN yarn install && yarn cache clean
