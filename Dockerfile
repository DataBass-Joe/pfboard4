# develop stage
FROM node:16.15.0 as develop-stage
ENV PORT=80
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .
# build stage
RUN echo $PORT
FROM develop-stage as build-stage
RUN yarn
RUN quasar build
# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
