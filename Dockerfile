# Stage 1: Build the Node.js application
FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Create a new stage using Node.js Alpine as the base image
FROM node:alpine AS alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 443
CMD ["node", "app.js"]