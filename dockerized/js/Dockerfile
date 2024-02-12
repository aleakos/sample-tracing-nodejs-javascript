# Use the official Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN yarn

# Copy local code to the container image.
COPY . .

# Service port
EXPOSE 8082
EXPOSE 8083

CMD ["node", "--require", "./tracing.js", "--require", "./chained-app.js", "app.js", "--config", "./config.json"]
