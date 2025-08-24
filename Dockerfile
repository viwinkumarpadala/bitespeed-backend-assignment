FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./

RUN npm install --include=dev

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]