# 🎬 Multi-Service Movie Booking System

A **scalable microservices architecture** for a movie ticket booking platform with horizontal scaling, load balancing, and multi-machine deployment support.

## 🎯 Features

✅ **Microservices Architecture** - Independent, deployable services  
✅ **API Gateway** - Centralized routing with load balancing  
✅ **Horizontal Scaling** - Run multiple service instances  
✅ **Load Balancing** - Round-robin distribution across instances  
✅ **CQRS Pattern** - Command/Query responsibility segregation  
✅ **Message Queue** - RabbitMQ for async communication  
✅ **Multi-Machine** - Deploy services across different machines  
✅ **Docker Support** - Containerized deployment  
✅ **Health Checks** - Service health monitoring  
✅ **Production Ready** - Comprehensive documentation  

## 📋 System Components

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│                     Port 3000                           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│           API GATEWAY (Load Balancer)                   │
│              Port 8080 (Round-Robin)                    │
└──────┬─────────────┬──────────────┬──────────────────────┘
       │             │              │
  ┌────▼──────┐ ┌───▼─────────┐ ┌──▼────────────┐
  │   USER    │ │   MOVIE     │ │  BOOKING     │
  │ SERVICE   │ │  SERVICE    │ │  SERVICE     │
  │ Port 8081 │ │ Port 8082   │ │ Port 8083    │
  └───────────┘ └─────────────┘ └──────────────┘
       │             │              │
       └──────┬──────┴──────┬───────┘
              │             │
         ┌────▼─────┐  ┌───▼──────┐
         │ MongoDB  │  │ RabbitMQ │
         │ 27017    │  │ 5672     │
         └──────────┘  └──────────┘
```

## 🚀 Quick Start

### Docker Compose (All-in-One)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api-gateway

# Access services
curl http://localhost:8080/health
```

### Local Development

```bash
# Terminal 1: Database
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7

# Terminal 2: Message Broker  
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Terminal 3: User Service
cd backend/auth-service && npm install && npm run dev

# Terminal 4: Movie Service
cd backend/Movie-service && npm install && npm run dev

# Terminal 5: Booking Service
cd backend/movie-booking && npm install && npm run build && npm run dev

# Terminal 6: API Gateway
cd api-gateway && npm install && npm run dev

# Terminal 7: Frontend
cd frontend && npm install && npm run dev
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 🚀 Get started in 5 minutes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 📦 Deploy to production / multiple machines |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🏗️ Understand system design & scaling |

## 🏗️ Project Structure

```
.
├── api-gateway/              # API Gateway with load balancing
│   ├── src/
│   │   ├── server.js         # Main server
│   │   └── routes/
│   │       └── proxyRules.js # Load balancing config
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Microservices
│   ├── auth-service/         # User authentication
│   │   ├── routes/
│   │   ├── models/
│   │   ├── config/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── Movie-service/        # Movie catalog
│   │   ├── routes/
│   │   ├── models/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── movie-booking/        # Booking engine
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── frontend/                 # React UI
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Full stack orchestration
├── DEPLOYMENT.md             # Production deployment guide
├── ARCHITECTURE.md           # System architecture
└── QUICKSTART.md            # Quick start guide
```

## 🔌 API Endpoints

### Via API Gateway

```bash
# Commands (Write Operations)
POST   /api/c/auth/register
POST   /api/c/auth/login
POST   /api/c/movies
PUT    /api/c/bookings/:id
DELETE /api/c/bookings/:id

# Queries (Read Operations)
GET    /api/q/users/:id
GET    /api/q/movies
GET    /api/q/bookings/:id

# System Status
GET    /api/services/status    # View all services
GET    /health                 # Health check
```

## 🔄 Load Balancing Configuration

The API Gateway supports multiple service instances with round-robin load balancing:

```env
# Single instance per service
USER_SERVICE_URLS=http://localhost:8081
MOVIE_SERVICE_URLS=http://localhost:8082
BOOKING_SERVICE_URLS=http://localhost:8083

# Multiple instances (load balanced)
USER_SERVICE_URLS=http://host1:8081,http://host2:8081,http://host3:8081
MOVIE_SERVICE_URLS=http://host1:8082,http://host2:8082,http://host3:8082
BOOKING_SERVICE_URLS=http://host1:8083,http://host2:8083,http://host3:8083
```

## 📊 Multi-Machine Deployment

Deploy services across multiple machines for horizontal scaling:

```
Machine 1 (Infrastructure)
├── MongoDB
└── RabbitMQ

Machine 2 (API Gateway & User Service)
├── API Gateway (Port 8080)
├── User Service Instance 1 (Port 8081)
└── User Service Instance 2 (Port 8084)

Machine 3 (Movie Service)
├── Movie Service Instance 1 (Port 8082)
└── Movie Service Instance 2 (Port 8085)

Machine 4 (Booking Service)
├── Booking Service Instance 1 (Port 8083)
└── Booking Service Instance 2 (Port 8086)
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## 🎛️ Configuration

### Environment Variables

Each service can be configured via `.env` files:

```bash
# Port and host
PORT=8080
HOST=0.0.0.0

# Database
MONGO_URI=mongodb://admin:password123@mongodb:27017/movie_db?authSource=admin

# Message broker
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Service instance info
SERVICE_NAME=user-service
INSTANCE_ID=1
```

### Database

- **MongoDB** (Port 27017)
  - Username: `admin`
  - Password: `password123`
  - Database: `movie_db`

### Message Broker

- **RabbitMQ** (Port 5672)
  - Username: `guest`
  - Password: `guest`
  - Management UI: http://localhost:15672

## 🏥 Health Checks

Monitor service health:

```bash
# API Gateway status
curl http://localhost:8080/api/services/status

# Individual service health
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
```

## 📈 Scaling Services

### Horizontal Scaling (Add Instances)

```bash
# Add another user service instance
docker run -d \
  --name user-service-3 \
  -p 8085:8081 \
  --env-file backend/auth-service/.env \
  user-service

# Update API Gateway load balancer
# Edit USER_SERVICE_URLS in .env to include new instance
```

### Vertical Scaling (More Resources)

```bash
# Increase memory/CPU for a service
docker update --memory 2g --cpus 2 user-service-1
```

## 🧪 Testing

### Test Load Balancing

```bash
# Make multiple requests to see round-robin distribution
for i in {1..6}; do
  curl -s http://localhost:8080/health | grep -o '"instanceId":"[^"]*"'
done
```

### Performance Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/q/movies

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8080/api/q/movies
```

## 📦 Docker Operations

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Remove all volumes (reset)
docker-compose down -v
```

## 🔐 Production Checklist

- [ ] Use strong JWT secrets (not defaults)
- [ ] Enable MongoDB authentication
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS certificates
- [ ] Setup monitoring and alerting
- [ ] Configure database backups
- [ ] Use separate .env files per environment
- [ ] Implement rate limiting
- [ ] Setup CI/CD pipeline
- [ ] Document all deployments

## 🛠️ Troubleshooting

### Service Connection Issues

```bash
# Check if service is running
docker-compose ps

# View service logs
docker-compose logs service-name

# Check network connectivity
docker-compose exec api-gateway ping user-service-1
```

### Database Connection Errors

```bash
# Test MongoDB connection
docker-compose exec user-service-1 mongosh -u admin -p password123 \
  --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Message Queue Issues

```bash
# View RabbitMQ queues
docker-compose exec rabbitmq rabbitmqctl list_queues
```

## 📝 License

This project is open source and available under the ISC License.

## 👥 Contributors

- Architecture & Implementation
- Documentation & Guides

## 🤝 Support

For issues or questions:

1. Check [QUICKSTART.md](./QUICKSTART.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Check service logs: `docker-compose logs`

## 🚀 Next Steps

1. **Get Started**: Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Learn Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Monitor**: Setup health checks and monitoring
5. **Scale**: Add more instances as needed

---

**Built for scalability, designed for performance, ready for production.**

For a detailed walkthrough, see [QUICKSTART.md](./QUICKSTART.md) 🎬
