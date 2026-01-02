FROM node:22 AS frontend-build
WORKDIR /Chat-bot-with-RAG-webclient/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:22 AS backend-build
WORKDIR /Chat-bot-with-RAG-webclient/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npx prisma generate --schema=./prisma/schema.prisma

FROM node:22
WORKDIR /Chat-bot-with-RAG-webclient

COPY --from=backend-build /Chat-bot-with-RAG-webclient/backend ./backend

COPY --from=frontend-build /Chat-bot-with-RAG-webclient/frontend/build ./backend/public

WORKDIR /Chat-bot-with-RAG-webclient/backend

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
