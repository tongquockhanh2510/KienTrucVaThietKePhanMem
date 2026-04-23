# 🚀 Multi-Service Architecture Deployment Guide

## Overview

This is a **scalable microservices architecture** with:
- **API Gateway**: Load balancer routing traffic across multiple service instances
- **Multiple service instances**: Each backend service can run on different machines
- **CQRS pattern**: Command and Query responsibility segregation
- **Message broker**: RabbitMQ for inter-service communication
- **Shared database**: MongoDB for data persistence

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Port 3000)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  API GATEWAY (Port 8080)                    │
│          (Load Balancer with Round-Robin)                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼────────┐  ┌──▼────────────┐  ┌──▼───────────────┐
    │ User Service   │  │ Movie Service │  │ Booking Service  │
    │  Instances:    │  │  Instances:   │  │  Instances:      │
    │  8081 (1,2)    │  │  8082 (1,2)   │  │  8083 (1,2)      │
    └────────────────┘  └───────────────┘  └──────────────────┘
            │               │                      │
            └───────────────┼──────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
        ┌───▼────────┐              ┌──────▼──────┐
        │  MongoDB   │              │  RabbitMQ   │
        │ (Port 27017)              │ (Port 5672) │
        └────────────┘              └─────────────┘
```

## Quick Start - Docker Compose

### Local Single-Machine Deployment

```bash
# 1. Navigate to project root
cd /path/to/project

# 2. Start all services with Docker Compose
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f api-gateway

# 5. Access services
# API Gateway: http://localhost:8080
# MongoDB: localhost:27017
# RabbitMQ UI: http://localhost:15672 (guest/guest)
```

### Service URLs (Docker Compose)

| Service | URL | Port |
|---------|-----|------|
| API Gateway | http://localhost:8080 | 8080 |
| User Service 1 | http://user-service-1:8081 | 8081 |
| User Service 2 | http://user-service-2:8081 | 8081 |
| Movie Service 1 | http://movie-service-1:8082 | 8082 |
| Movie Service 2 | http://movie-service-2:8082 | 8082 |
| Booking Service 1 | http://booking-service-1:8083 | 8083 |
| Booking Service 2 | http://booking-service-2:8083 | 8083 |

---

## Multi-Machine Deployment

### Architecture Overview

For production with multiple machines:

**Machine 1**: MongoDB + RabbitMQ (Infrastructure)
**Machine 2**: API Gateway + 2x User Service instances
**Machine 3**: 2x Movie Service instances
**Machine 4**: 2x Booking Service instances

### Step 1: Setup Infrastructure (MongoDB & RabbitMQ)

**On Machine 1 (Infrastructure):**

```bash
# Install Docker and Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Create docker-compose for only infrastructure
cat > docker-compose-infra.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db
    networks:
      - microservices-network

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - microservices-network

networks:
  microservices-network:
    driver: bridge

volumes:
  mongodb_data:
  rabbitmq_data:
EOF

docker-compose -f docker-compose-infra.yml up -d
```

**Note down Machine 1 IP address** (e.g., `192.168.1.100`)

### Step 2: Deploy API Gateway (Machine 2)

**On Machine 2:**

```bash
# Clone or copy the project
git clone <your-repo>
cd <project-root>

# Create .env file for API Gateway
cat > api-gateway/.env << 'EOF'
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Replace these IPs with your actual machine IPs
USER_SERVICE_URLS=http://192.168.1.102:8081,http://192.168.1.103:8081
MOVIE_SERVICE_URLS=http://192.168.1.103:8082,http://192.168.1.103:8082
BOOKING_SERVICE_URLS=http://192.168.1.104:8083,http://192.168.1.104:8083
EOF

# Build and run API Gateway
docker build -t api-gateway ./api-gateway
docker run -d \
  --name api-gateway \
  -p 8080:8080 \
  --env-file api-gateway/.env \
  api-gateway
```

### Step 3: Deploy User Service (Machine 2)

**On Machine 2:**

```bash
# Create .env for User Service instances
cat > backend/auth-service/.env.1 << 'EOF'
PORT=8081
HOST=0.0.0.0
NODE_ENV=production
SERVICE_NAME=user-service
INSTANCE_ID=1
MONGO_URI=mongodb://admin:password123@192.168.1.100:27017/movie_db?authSource=admin
RABBITMQ_URL=amqp://guest:guest@192.168.1.100:5672
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
EOF

# Build and run User Service instances
docker build -t user-service ./backend/auth-service

# Instance 1
docker run -d \
  --name user-service-1 \
  -p 8081:8081 \
  --env-file backend/auth-service/.env.1 \
  user-service

# Instance 2
cp backend/auth-service/.env.1 backend/auth-service/.env.2
sed -i 's/INSTANCE_ID=1/INSTANCE_ID=2/' backend/auth-service/.env.2

docker run -d \
  --name user-service-2 \
  -p 8084:8081 \
  --env-file backend/auth-service/.env.2 \
  user-service
```

### Step 4: Deploy Movie Service (Machine 3)

**On Machine 3:**

```bash
git clone <your-repo>
cd <project-root>

# Create .env for Movie Service instances
cat > backend/Movie-service/.env.1 << 'EOF'
PORT=8082
HOST=0.0.0.0
NODE_ENV=production
SERVICE_NAME=movie-service
INSTANCE_ID=1
MONGO_URI=mongodb://admin:password123@192.168.1.100:27017/movie_db?authSource=admin
CORS_ORIGIN=*
EOF

# Build and run Movie Service instances
docker build -t movie-service ./backend/Movie-service

docker run -d \
  --name movie-service-1 \
  -p 8082:8082 \
  --env-file backend/Movie-service/.env.1 \
  movie-service

docker run -d \
  --name movie-service-2 \
  -p 8085:8082 \
  --env-file backend/Movie-service/.env.1 \
  movie-service
```

### Step 5: Deploy Booking Service (Machine 4)

**On Machine 4:**

```bash
git clone <your-repo>
cd <project-root>

# Create .env for Booking Service instances
cat > backend/movie-booking/.env.1 << 'EOF'
PORT=8083
HOST=0.0.0.0
NODE_ENV=production
SERVICE_NAME=booking-service
INSTANCE_ID=1
MONGO_URI=mongodb://admin:password123@192.168.1.100:27017/movie_db?authSource=admin
RABBITMQ_URL=amqp://guest:guest@192.168.1.100:5672
USER_SERVICE_URL=http://192.168.1.102:8081
MOVIE_SERVICE_URL=http://192.168.1.103:8082
CORS_ORIGINS=*
EOF

# Build and run Booking Service instances
docker build -t booking-service ./backend/movie-booking

docker run -d \
  --name booking-service-1 \
  -p 8083:8083 \
  --env-file backend/movie-booking/.env.1 \
  booking-service

docker run -d \
  --name booking-service-2 \
  -p 8086:8083 \
  --env-file backend/movie-booking/.env.1 \
  booking-service
```

---

## Configuration Guide

### API Gateway Load Balancing

The API Gateway supports **round-robin load balancing** for multiple service instances.

**Configuration Format:**
```env
SERVICE_URLS=http://host1:port,http://host2:port,http://host3:port
```

**Example with 3 instances:**
```env
USER_SERVICE_URLS=http://192.168.1.102:8081,http://192.168.1.102:8084,http://192.168.1.102:8087
MOVIE_SERVICE_URLS=http://192.168.1.103:8082,http://192.168.1.103:8085,http://192.168.1.103:8088
BOOKING_SERVICE_URLS=http://192.168.1.104:8083,http://192.168.1.104:8086,http://192.168.1.104:8089
```

### Service Communication

Services communicate:
- **Internal (Docker)**: via service names (e.g., `http://user-service-1:8081`)
- **External (Multi-machine)**: via IP addresses (e.g., `http://192.168.1.102:8081`)

### Health Checks

Each service provides health check endpoints:

```bash
# Check individual service health
curl http://192.168.1.102:8081/health

# Check API Gateway and all services
curl http://192.168.1.102:8080/api/services/status
```

---

## Deployment with Docker Swarm / Kubernetes

For advanced deployments, you can use orchestration tools:

### Docker Swarm

```bash
# Initialize swarm on manager node
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml movie-app
```

### Kubernetes

```bash
# Generate deployment manifests
kubectl apply -f k8s-manifests/

# Check pod status
kubectl get pods

# Scale services
kubectl scale deployment user-service --replicas=3
```

---

## API Endpoints

### Via API Gateway

```bash
# Commands (POST/PUT/DELETE)
POST   /api/c/auth/register
POST   /api/c/auth/login
POST   /api/c/movies
PUT    /api/c/bookings/:id
DELETE /api/c/bookings/:id

# Queries (GET)
GET    /api/q/users/:id
GET    /api/q/movies
GET    /api/q/bookings/:id

# Service Status
GET    /api/services/status
GET    /health
```

### Direct Service Access (for testing)

```bash
# User Service
GET    http://192.168.1.102:8081/health
GET    http://192.168.1.102:8081/info

# Movie Service
GET    http://192.168.1.103:8082/health
GET    http://192.168.1.103:8082/info

# Booking Service
GET    http://192.168.1.104:8083/health
GET    http://192.168.1.104:8083/info
```

---

## Monitoring & Debugging

### View Logs

```bash
# Docker Compose
docker-compose logs -f user-service-1

# Docker
docker logs -f user-service-1

# Kubernetes
kubectl logs -f deployment/user-service
```

### Performance Tuning

1. **Scale services**: Add more replicas in docker-compose or Kubernetes
2. **Monitor load**: Use `docker stats` or Prometheus
3. **Database indexing**: Optimize MongoDB queries
4. **Caching**: Add Redis for session/data caching

### Common Issues

| Issue | Solution |
|-------|----------|
| Service timeout | Check network connectivity and service health |
| Database connection error | Verify MongoDB credentials and firewall rules |
| RabbitMQ connection failed | Check RabbitMQ is running and accessible |
| API Gateway returns 502 | Verify all service URLs are correct and services are running |

---

## Production Checklist

- [ ] Use strong JWT secrets (not "your-secret-key")
- [ ] Enable MongoDB authentication
- [ ] Set NODE_ENV=production
- [ ] Configure SSL/TLS certificates
- [ ] Setup monitoring and alerting
- [ ] Configure backup for MongoDB
- [ ] Use environment-specific .env files
- [ ] Implement rate limiting on API Gateway
- [ ] Setup CI/CD pipeline for deployments
- [ ] Document all IP addresses and ports
- [ ] Test failover scenarios

---

## Cleanup

### Docker Compose
```bash
docker-compose down
docker volume prune
```

### Docker
```bash
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi api-gateway user-service movie-service booking-service
```

### Kubernetes
```bash
kubectl delete -f k8s-manifests/
```

---

## Support & Documentation

- **API Gateway**: See [api-gateway/README.md](./api-gateway/README.md)
- **User Service**: See [backend/auth-service/README.md](./backend/auth-service/README.md)
- **Movie Service**: See [backend/Movie-service/note.txt](./backend/Movie-service/note.txt)
- **Booking Service**: See [backend/movie-booking/README.md](./backend/movie-booking/README.md)
