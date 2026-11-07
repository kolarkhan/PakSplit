FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY server/package.json server/tsconfig.json ./server/

RUN npm install

COPY . .

RUN npm run build --workspace server

WORKDIR /app/server

EXPOSE 4000

CMD ["npm", "run", "start"]

