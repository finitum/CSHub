# build stage
FROM node:11-alpine as build-stage

# make the 'app' folder the current working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

COPY . .

# production stage
FROM nginx:1.15-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
