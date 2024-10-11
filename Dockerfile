# syntax = docker/dockerfile:1.2
## Install dev and compilation dependencies, build files
FROM alpine:3.20 as build
LABEL stage=build
WORKDIR /iceshrimp

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk python3 py3-setuptools nodejs-current npm linux-headers

# Copy in all files for the build
COPY . ./

# Prepare yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache cp -r .yarncache/. .yarn

# Configure corepack and install dev mode dependencies for compilation
RUN corepack enable && corepack prepare --activate && yarn --immutable

# Save yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache rm -rf .yarncache/* && cp -r .yarn/. .yarncache

# Build the thing
RUN env NODE_ENV=production yarn build

# Prepare focused yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache_focused cp -r .yarncache_focused/. .yarn

# Remove dev deps
RUN yarn focus-production

# Save focused yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache_focused rm -rf .yarncache/* && cp -r .yarn/. .yarncache_focused

## Runtime container
FROM alpine:3.20
LABEL stage=runtime
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg zip unzip nodejs-current libheif-dev

# Copy built files
COPY --from=build /iceshrimp /iceshrimp

# Configure corepack
RUN corepack enable && corepack prepare --activate

ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "run", "migrateandstart" ]
