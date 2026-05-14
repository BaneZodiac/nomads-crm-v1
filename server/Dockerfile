FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p data
RUN npx tsx src/seed.ts
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
