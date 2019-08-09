FROM node:12-alpine

ARG DOCKER_CLI_VERSION="19.03.1"
ENV DOWNLOAD_URL="https://download.docker.com/linux/static/stable/x86_64/docker-$DOCKER_CLI_VERSION.tgz"

# install docker client
RUN : \
 && mkdir -p /tmp/download \
 && wget -qO- "$DOWNLOAD_URL" | tar xz -C /tmp/download \
 && mv /tmp/download/docker/docker /usr/local/bin/ \
 && rm -rf /tmp/download \
 && :

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tslint.json ./
COPY src/ src/
COPY .docker/entrypoint ./
COPY .docker/bin/* /usr/local/bin/
RUN npm run build

ENTRYPOINT ["/app/entrypoint"]
