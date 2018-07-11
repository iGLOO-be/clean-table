FROM node:10.6.0

WORKDIR /app
ADD . /app

RUN yarn --pure-lockfile --production && yarn build

ENV NODE_NO_WARNINGS=1

ENTRYPOINT [ "/app/bin/clean-table" ]
