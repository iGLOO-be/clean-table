FROM node:10.6.0

WORKDIR /app
ADD . /app

RUN yarn --pure-lockfile --production && yarn build

ENTRYPOINT [ "/app/bin/clean-table" ]
