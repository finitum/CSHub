# build stage
FROM cshub-shared as build-server

# set the current working directory
WORKDIR /app/cshub-server

RUN yarn global add typescript

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN apk add python make g++ --no-cache
RUN yarn install

# Copy src files
COPY . .
COPY ./src/SettingsBaseline.ts ./src/settings.ts

# build TS
RUN tsc

CMD ["node", "src/index.js"]
