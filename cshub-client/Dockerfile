ARG BASE_IMAGE=cshub-shared

# build stage
FROM $BASE_IMAGE as build-client


# Set work dir
WORKDIR /app/cshub-client

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Get dependencies
RUN yarn install

# Copy source
COPY . .

# Build source
RUN yarn build

# production stage
FROM nginx:1.15-alpine as production-stage
WORKDIR /usr/share/nginx/html
COPY --from=build-client /app/cshub-client/dist .
COPY --from=build-client /app/cshub-client/src/config.sh .
RUN ["chmod", "+x", "./config.sh"]
CMD ["/usr/share/nginx/html/config.sh"]
EXPOSE 80

