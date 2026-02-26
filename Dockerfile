# develop stage
FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
COPY quasar.config.js ./
# RUN npm add @quasar/cli
COPY . .
# build stage
RUN npm install
RUN npm install -g @vue/cli
RUN npm install -g @quasar/cli
RUN quasar build
# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
