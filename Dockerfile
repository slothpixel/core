FROM node:16-alpine

RUN apk update && apk add bash && apk add curl && apk add git

ENV NPM_CONFIG_LOGLEVEL warn

ENV NODE_OPTIONS --max-old-space-size=2048

COPY . /usr/src

WORKDIR /usr/src

RUN npm run build

ENV PATH /usr/src/node_modules/.bin:$PATH

CMD ["bash"]
