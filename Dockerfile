FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8000
RUN npm run build
CMD ["npm", "start"]