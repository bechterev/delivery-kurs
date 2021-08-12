FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY middleware/ ./middleware
COPY models/ ./models
COPY Routes/ ./Routes
COPY index.js ./
COPY README.md ./

CMD ["npm", "start"]