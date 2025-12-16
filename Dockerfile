# Build Stage
FROM node:20-alpine AS build

# Install Python and other build dependencies including tools needed for node-gyp
# RUN apk add --no-cache --virtual .gyp \
#     python3 \
#     py3-pip \
#     python3-dev \
#     build-base \
#     make \
#     g++ \
#     && ln -sf python3 /usr/bin/python

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev \
    libpng-dev \
    librsvg-dev

ENV PYTHON=/usr/bin/python3
ENV NEXT_TELEMETRY_DISABLED=1

# Setup the work directory
WORKDIR /app
# COPY package*.json yarn.lock ./
COPY *.json yarn.lock  ./
# Install dependencies
# RUN npm i yarn
RUN yarn install --force
# RUN npm i --force

# Copy the application code
COPY . .

# Build the application
RUN yarn run build

# Production Stage
# FROM node:24-alpine AS production

# WORKDIR /app

# # Copy built assets from the build stage
# COPY --from=build /app/package*.json ./
# COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
# # COPY --from=build /app/node_modules ./node_modules

# ENV NODE_ENV=production
# EXPOSE 8001

# CMD ["yarn", "start"]
