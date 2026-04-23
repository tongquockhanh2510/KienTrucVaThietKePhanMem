# Docker Setup Guide

Hướng dẫn sử dụng Docker Compose để khởi chạy MongoDB và RabbitMQ.

## 📋 Yêu cầu

- **Docker**: https://www.docker.com/products/docker-desktop
- **Docker Compose**: Đi kèm với Docker Desktop

## 🚀 Khởi chạy Services

### 1. Khởi chạy MongoDB + RabbitMQ
```bash
docker-compose up -d
```

**Lệnh giải thích:**
- `up`: Start containers
- `-d`: Detach mode (chạy background)

**Output:**
```
Creating mongodb ... done
Creating rabbitmq ... done
```

### 2. Kiểm tra trạng thái
```bash
docker-compose ps
```

**Output mong muốn:**
```
NAME         IMAGE                      STATUS
mongodb      mongo:5.0                  Up (healthy)
rabbitmq     rabbitmq:3.12-management  Up (healthy)
```

## 🌐 Truy cập Services

### MongoDB
- **Connection String:** `mongodb://admin:password123@localhost:27017/user-service`
- **Host:** localhost
- **Port:** 27017
- **Username:** admin
- **Password:** password123

### RabbitMQ
- **AMQP Connection:** `amqp://guest:guest@localhost`
- **Management UI:** http://localhost:15672
- **Username:** guest
- **Password:** guest

## ⚙️ Cập nhật .env

Cập nhật `.env` file của User Service để khớp với Docker:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/user-service
RABBITMQ_URL=amqp://guest:guest@localhost
```

## ⏹️ Dừng Services

```bash
# Stop containers (giữ data)
docker-compose stop

# Stop và xóa containers (giữ data)
docker-compose down

# Stop và xóa hết (xóa data)
docker-compose down -v
```

## 📊 Management UIs

### RabbitMQ Management Console
```
URL: http://localhost:15672
Username: guest
Password: guest
```

Tại đây bạn có thể:
- Xem exchanges
- Xem queues
- Monitor messages
- Xem connections

### MongoDB Compass (Optional)
Tải MongoDB Compass: https://www.mongodb.com/products/compass

```
Connection: mongodb://admin:password123@localhost:27017/
```

## 🔍 Debug Commands

### Xem logs
```bash
# MongoDB logs
docker-compose logs mongodb

# RabbitMQ logs
docker-compose logs rabbitmq

# Follow logs (real-time)
docker-compose logs -f rabbitmq
```

### Vào container shell
```bash
# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# RabbitMQ shell
docker-compose exec rabbitmq bash
```

### Kiểm tra volumes
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect auth-service_mongodb_data
```

## 🚨 Troubleshooting

### Port already in use
```bash
# Nếu port 27017 bị chiếm
lsof -i :27017  # List process
kill -9 <PID>   # Kill process

# Hoặc thay đổi port trong docker-compose.yml
# "27018:27017"  # Map port 27018 ngoài sang 27017 trong
```

### Container không start
```bash
# Check logs
docker-compose logs mongodb

# Xóa volume và restart
docker-compose down -v
docker-compose up -d
```

### Connection refused
```bash
# Đảm bảo containers đang chạy
docker-compose ps

# Kiểm tra network
docker network ls
docker network inspect auth-service_app-network
```

## 📝 docker-compose.yml Mô tả

```yaml
version: '3.8'                    # Docker Compose version

services:
  mongodb:
    image: mongo:5.0              # MongoDB version 5.0
    container_name: mongodb       # Container name
    restart: always               # Auto restart if crash
    ports:
      - "27017:27017"             # Map port (host:container)
    environment:                  # Environment variables
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db     # Persist data
    networks:
      - app-network               # Custom network

  rabbitmq:
    image: rabbitmq:3.12-management   # With management plugin
    # ... similar config ...
    healthcheck:                       # Health check
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5

volumes:                          # Named volumes
  mongodb_data:
  rabbitmq_data:

networks:                         # Custom network
  app-network:
    driver: bridge
```

## ✅ Checklist

- [ ] Docker Desktop installed
- [ ] docker-compose.yml created
- [ ] Run `docker-compose up -d`
- [ ] Check `docker-compose ps`
- [ ] Test MongoDB connection
- [ ] Test RabbitMQ at http://localhost:15672
- [ ] Update .env file
- [ ] Run User Service

## 📚 Tài liệu

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- MongoDB Docker: https://hub.docker.com/_/mongo
- RabbitMQ Docker: https://hub.docker.com/_/rabbitmq
