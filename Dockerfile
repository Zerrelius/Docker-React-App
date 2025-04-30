FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY ./dist /usr/share/nginx/html

EXPOSE 80