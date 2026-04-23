# Quick Start Guide - Local Development

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (optional, for local development)
- MongoDB client tools (optional)
- Git

## Quick Start (All-in-One)

### 1. Clone/Setup Project
```bash
cd /path/to/project
```

### 2. Build and Run All Services
```bash
# Start all services including DB and message broker
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
sleep 30

# Check all services are running
docker-compose ps
```

### 3. Verify Services
```bash
# Check API Gateway health
curl http://localhost:8080/health

# Check service registry
curl http://localhost:8080/api/services/status

# Check individual services
curl http://localhost:8081/health  # User Service 1
curl http://localhost:8082/health  # Movie Service 1
curl http://localhost:8083/health  # Booking Service 1
```

### 4. Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| MongoDB | mongodb://admin:password123@localhost:27017 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |

---

## Development Workflow

### Running Individual Services Locally (without Docker)

#### Terminal 1: User Service
```bash
cd backend/auth-service
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:8081
```

#### Terminal 2: Movie Service
```bash
cd backend/Movie-service
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:8082
```

#### Terminal 3: Booking Service
```bash
cd backend/movie-booking
npm install
cp .env.example .env
npm run build
npm run dev
# Runs on http://localhost:8083
```

#### Terminal 4: API Gateway
```bash
cd api-gateway
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:8080
```

#### Terminal 5: Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Common Commands

### Docker Compose Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs of specific service
docker-compose logs -f user-service-1

# Restart specific service
docker-compose restart api-gateway

# Remove all volumes (reset database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

### Database Operations

```bash
# Connect to MongoDB
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# View databases
show dbs

# Switch to movie_db
use movie_db

# View collections
show collections

# View sample users
db.users.find().limit(5)

# Clear all data
db.users.deleteMany({})
db.movies.deleteMany({})
db.bookings.deleteMany({})
```

### RabbitMQ Operations

```bash
# View RabbitMQ management UI
# Open browser: http://localhost:15672
# Username: guest
# Password: guest

# View queues
docker exec -it rabbitmq rabbitmqctl list_queues

# Clear all queues
docker exec -it rabbitmq rabbitmqctl purge_queue_contents_and_delete_queue
```

---

## Testing API Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/c/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get movies
curl http://localhost:8080/api/q/movies

# Create booking
curl -X POST http://localhost:8080/api/c/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "movieId": "MOVIE_ID",
    "seats": 2
  }'
```

### Using Postman

1. Import the Postman collection (if available)
2. Set base URL: `http://localhost:8080`
3. Test endpoints:
   - GET /health
   - GET /api/services/status
   - GET /api/q/movies
   - POST /api/c/auth/register

---

## Debugging

### View Service Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api-gateway

# Follow logs (live)
docker-compose logs -f user-service-1

# Last 50 lines
docker-compose logs --tail=50

# With timestamps
docker-compose logs --timestamps
```

### Check Service Health

```bash
# Check if service is responding
curl -v http://localhost:8081/health

# Check network connectivity
docker-compose exec api-gateway ping user-service-1

# Check MongoDB connection
docker-compose exec user-service-1 node -e \
  "require('mongoose').connect('mongodb://admin:password123@mongodb:27017', {authSource: 'admin'}).then(()=>console.log('OK')).catch(e=>console.log(e.message))"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Port already in use" | Kill the process or use different port: `docker-compose down` |
| MongoDB connection error | Check MongoDB is running: `docker-compose logs mongodb` |
| RabbitMQ connection error | Check RabbitMQ is running: `docker-compose logs rabbitmq` |
| Service returns 502 | Check if downstream service is running: `docker-compose ps` |
| "Cannot GET /" | API Gateway might not be routing properly - check routes config |

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install (macOS)
brew install httpd

# Simple load test
ab -n 1000 -c 10 http://localhost:8080/api/q/movies

# With requests per second limit
ab -n 1000 -c 10 -r http://localhost:8080/health
```

### Load Testing with wrk

```bash
# Install (macOS)
brew install wrk

# Simple load test
wrk -t4 -c100 -d30s http://localhost:8080/api/q/movies
```

---

## Database Seeding (Optional)

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Run in MongoDB shell
use movie_db

db.movies.insertMany([
  { title: "Movie 1", description: "Description 1", price: 10 },
  { title: "Movie 2", description: "Description 2", price: 12 },
  { title: "Movie 3", description: "Description 3", price: 15 }
])

db.movies.find()
```

---

## Environment Variables

### For Local Development

Copy the `.env.example` files to `.env` and update:

```bash
# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Auth Service
cp backend/auth-service/.env.example backend/auth-service/.env

# Movie Service
cp backend/Movie-service/.env.example backend/Movie-service/.env

# Booking Service
cp backend/movie-booking/.env.example backend/movie-booking/.env
```

### Key Variables

```env
# Services
PORT=8080
HOST=localhost
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/movie_db
MONGO_URI=mongodb://admin:password123@mongodb:27017/movie_db?authSource=admin

# Message Broker
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Authentication
JWT_SECRET=dev-secret-key
JWT_EXPIRY=24h
```

---

## Cleanup

### Stop and Remove Everything

```bash
# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Prune all unused Docker resources
docker system prune -a --volumes
```

---

## Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
3. Check individual service README files for more details
4. Setup CI/CD pipeline for automated testing and deployment

---

## Support

For issues or questions:
1. Check service logs: `docker-compose logs`
2. Check health endpoints: `curl http://localhost:8080/health`
3. Review configuration files
4. Check network connectivity: `docker-compose ps`

Happy developing! 🚀
