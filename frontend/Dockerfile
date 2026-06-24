FROM node:22-alpine

WORKDIR /app

# package.jsonがある場合のみインストール
COPY package*.json ./

RUN if [ -f package.json ]; then npm install; fi

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "if [ -f package.json ]; then npm run dev; else echo 'No package.json found. Please initialize Next.js project.'; tail -f /dev/null; fi"]
