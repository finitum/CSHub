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
COPY --from=build-client /app/cshub-client/dist /usr/share/nginx/html
EXPOSE 80
