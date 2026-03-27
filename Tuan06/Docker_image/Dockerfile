# Stage 1: Prepare dependencies
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Runtime (nhẹ)
FROM node:18-alpine

WORKDIR /app

# chỉ copy những gì cần thiết
COPY --from=builder /app ./

# chạy app
CMD ["node", "index.js"]