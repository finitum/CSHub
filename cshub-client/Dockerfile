# Available at cshubnl/shared
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

# Add curl for health check
RUN apk add curl --no-cache

# Copy over build files
WORKDIR /usr/share/nginx/html
COPY --from=build-client /app/cshub-client/dist .
COPY --from=build-client /app/cshub-client/src/config.sh .
COPY --from=build-client /app/cshub-client/nginx.conf /etc/nginx/nginx.conf

# Make the config.js from env generator executable
RUN ["chmod", "+x", "./config.sh"]

# Expose port 80 for nginx
EXPOSE 80

# Curl localhost to check if healthy
HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1

# Runs nginx and generates config from env vars
CMD ["/usr/share/nginx/html/config.sh"]

