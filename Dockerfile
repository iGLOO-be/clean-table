FROM node:10.6.0-alpine

ENV NODE_NO_WARNINGS=1

WORKDIR /app
ADD . /app

RUN yarn --pure-lockfile --production && yarn build

ENTRYPOINT [ "/app/bin/clean-table" ]
