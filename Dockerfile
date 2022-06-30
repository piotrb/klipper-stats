FROM node as base

RUN mkdir -p /app
RUN chown -R node:node /app

WORKDIR /app

USER node:node
ENV HOME=/home/node

###

FROM base as prod

COPY --chown=node:node .yarn/releases /app/.yarn/releases/
COPY --chown=node:node .yarn/plugins /app/.yarn/plugins/
COPY --chown=node:node package.json .yarnrc.yml yarn.lock /app/

RUN --mount=type=cache,target=/opt/.yarn,id=yarn,uid=1000,gid=1000 YARN_CACHE_FOLDER=/opt/.yarn \
  yarn workspaces focus --all --production

###

FROM prod as build

RUN --mount=type=cache,target=/opt/.yarn,id=yarn,uid=1000,gid=1000 YARN_CACHE_FOLDER=/opt/.yarn \
  yarn workspaces focus --all

COPY --chown=node:node tsconfig.json /app
COPY --chown=node:node src /app/src

RUN yarn tsc --outDir dist

###

FROM base as dev

###

FROM prod

COPY --chown=node:node --from=build /app/dist /app/dist

CMD node dist/main.js
