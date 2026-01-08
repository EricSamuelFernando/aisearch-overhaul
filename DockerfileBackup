# Build Stage
FROM node:22-alpine AS build

# Install Python and other build dependencies including tools needed for node-gyp
RUN apk add --no-cache --virtual .gyp \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# RUN apk add --no-cache \
#     python3 \
#     make \
#     g++ \
#     libc6-compat \
#     cairo-dev \
#     pango-dev \
#     jpeg-dev \
#     giflib-dev \
#     pixman-dev \
#     libpng-dev \
#     librsvg-dev

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
FROM node:22-alpine AS production

ARG NODE_ENV=production
ARG PORT=8001

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV AWS_LWA_READINESS_CHECK_PORT=${PORT}
ENV AWS_LWA_ENABLE=true
EXPOSE ${PORT}

WORKDIR /app

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

# # Copy built assets from the build stage
# COPY --from=build /app/package*.json ./
# COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
# # COPY --from=build /app/node_modules ./node_modules

# RUN apk add --no-cache \
#     python3 \
#     make \
#     g++ \
#     libc6-compat \
#     cairo-dev \
#     pango-dev \
#     jpeg-dev \
#     giflib-dev \
#     pixman-dev \
#     libpng-dev \
#     librsvg-dev

# Copy standalone output
COPY --from=build /app/.next/standalone ./
# COPY --from=build /app/.next/static ./.next/static
# COPY --from=build /app/public ./public

CMD ["node", "server.js"]
