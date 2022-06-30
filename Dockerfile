FROM node as base

RUN mkdir -p /app
WORKDIR /app

COPY .yarn/releases /app/.yarn/releases/
COPY package.json .yarnrc.yml yarn.lock /app/

RUN --mount=type=cache,target=/root/.yarn,id=yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

###

FROM base

COPY src /app/src

RUN yarn build

CMD node src/main.js
