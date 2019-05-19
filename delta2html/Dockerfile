# Available at cshubnl/shared
ARG BASE_IMAGE=cshub-shared

# build stage
FROM $BASE_IMAGE as build-server

# Set the current working directory
WORKDIR /app/cshub-delta2html

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies and subsequently remove the build dependencies
RUN yarn install && yarn cache clean

# Copy source files
COPY . .
#COPY ./src/SettingsBaseline.ts ./src/settings.ts

# Install TSC, Compiles TS, Remove TSC
RUN yarn global add typescript && tsc && yarn global remove typescript && yarn cache clean

CMD ["node", "src/index.js"]
