# Build Stage
FROM node:22-alpine AS BUILD_IMAGE

# Install Python and other build dependencies including tools needed for node-gyp
RUN apk add --no-cache --virtual .gyp \
        python3 \
        py3-pip \
        python3-dev \
        build-base \
        make \
        g++ \
    && ln -sf python3 /usr/bin/python

# Setup the work directory
WORKDIR /app
# COPY package*.json yarn.lock ./
COPY package*.json  ./
# Install dependencies
RUN yarn install --force
RUN npm i --force

# Copy the application code
COPY . .

# Build the application
RUN yarn run build

# Production Stage
FROM node:22-alpine AS PRODUCTION_STAGE

WORKDIR /app

# Copy built assets from the build stage
COPY --from=BUILD_IMAGE /app/package*.json ./
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 8001

CMD ["yarn", "start"]
