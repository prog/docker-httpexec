FROM node:12-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tslint.json ./
COPY src/ src/
COPY .docker/entrypoint ./
COPY .docker/bin/* /usr/local/bin/
RUN npm run build

ENTRYPOINT ["/app/entrypoint"]
