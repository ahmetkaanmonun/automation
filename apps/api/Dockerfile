FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY apps/api/package*.json apps/api/
RUN npm install --prefix apps/api

COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run prisma:generate
RUN npm run build
RUN npx playwright install --with-deps chromium

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npm run prisma:seed && node dist/main.js"]
