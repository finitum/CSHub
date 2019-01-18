# Available at cshubnl/shared
ARG BASE_IMAGE=cshub-shared

# build stage
FROM $BASE_IMAGE as build-server

# Set the current working directory
WORKDIR /app/cshub-server

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies and subsequently remove the build dependencies
RUN apk add python make g++ --no-cache -t builddep && yarn install && apk del builddep && yarn cache clean

# Copy source files
COPY . .
COPY ./src/SettingsBaseline.ts ./src/settings.ts

# Install TS, Compiles TS, Remove TS
RUN yarn global add typescript && tsc && yarn global remove typescript && yarn cache clean

CMD ["node", "src/index.js"]
