FROM node

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies

COPY package.json .

RUN npm install

CMD ["./node_modules/.bin/nodemon", "index.js"]
