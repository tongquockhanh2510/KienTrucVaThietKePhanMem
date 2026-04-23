# Architecture & Scaling Guide

## System Architecture

### Microservices Pattern

This system implements a **microservices architecture** with the following characteristics:

1. **Independent Services**: Each service runs independently and can be deployed separately
2. **Load Balanced**: API Gateway distributes requests using round-robin load balancing
3. **Asynchronous Communication**: Services communicate via RabbitMQ for decoupling
4. **Stateless Design**: Services don't store session state, enabling horizontal scaling
5. **CQRS Pattern**: Command and Query responsibility segregation at API level

### Service Roles

```
┌─────────────────────────────────────────────────────────┐
│ API GATEWAY (Port 8080)                                 │
│ - Routes requests to appropriate services               │
│ - Load balances across multiple instances               │
│ - CQRS: Separates read (query) and write (command) ops  │
└──────────────────────┬──────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼──────────────┐ ┌─▼──────────────┐ ┌─▼────────────┐
│ USER SERVICE     │ │ MOVIE SERVICE  │ │ BOOKING SRV  │
│ - Auth           │ │ - Movies list  │ │ - Bookings   │
│ - Registration   │ │ - Details      │ │ - Tickets    │
│ - JWT tokens     │ │ - Search       │ │ - Status     │
└──────────────────┘ └────────────────┘ └──────────────┘
    (Port 8081)          (Port 8082)      (Port 8083)
```

---

## Horizontal Scaling

### Scale Individual Services

To add more instances of a service:

#### Option 1: Docker Compose (Development)

Update `docker-compose.yml`:

```yaml
user-service-3:
  build:
    context: ./backend/auth-service
  environment:
    PORT: 8081
    INSTANCE_ID: 3
    # ... other env vars
  networks:
    - microservices-network

user-service-4:
  build:
    context: ./backend/auth-service
  environment:
    PORT: 8081
    INSTANCE_ID: 4
    # ... other env vars
  networks:
    - microservices-network
```

Then update API Gateway `.env`:
```env
USER_SERVICE_URLS=http://user-service-1:8081,http://user-service-2:8081,http://user-service-3:8081,http://user-service-4:8081
```

#### Option 2: Docker Run (Production)

```bash
# Create new instance
docker run -d \
  --name user-service-3 \
  -p 8085:8081 \
  --env-file user-service.env \
  user-service

# Update API Gateway
docker exec api-gateway /bin/sh -c \
  'echo "USER_SERVICE_URLS=http://user-service-1:8081,http://user-service-2:8081,http://user-service-3:8081" > .env'

docker restart api-gateway
```

#### Option 3: Kubernetes

```bash
kubectl scale deployment user-service --replicas=5
```

### Load Balancing Algorithm

The API Gateway uses **round-robin** load balancing:

```javascript
// Request flow example:
Request 1 → User Service Instance 1
Request 2 → User Service Instance 2
Request 3 → User Service Instance 1
Request 4 → User Service Instance 2
// Pattern repeats...
```

---

## Vertical Scaling

### Increase Service Resources

#### Docker

```bash
docker update \
  --memory 2g \
  --cpus 2 \
  user-service-1
```

#### Docker Compose

```yaml
user-service-1:
  # ... other config
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

#### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: user-service
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
          requests:
            cpu: "1"
            memory: "1Gi"
```

---

## Performance Optimization

### 1. Database Optimization

```javascript
// Add indexes in MongoDB
db.users.createIndex({ email: 1 });
db.movies.createIndex({ title: 1, genre: 1 });
db.bookings.createIndex({ userId: 1, status: 1 });
```

### 2. Caching Layer

Add Redis for frequently accessed data:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

Then use in services:
```javascript
const redis = require('redis');
const client = redis.createClient({ host: 'redis', port: 6379 });

app.get('/movies', async (req, res) => {
  // Try cache first
  const cached = await client.get('movies');
  if (cached) return res.json(JSON.parse(cached));
  
  // Query database
  const movies = await Movie.find();
  
  // Cache for 1 hour
  await client.setex('movies', 3600, JSON.stringify(movies));
  
  res.json(movies);
});
```

### 3. Connection Pooling

MongoDB connection pooling (already handled by Mongoose):

```javascript
mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

### 4. Message Queue Optimization

For RabbitMQ:

```javascript
// Set prefetch limit
channel.prefetch(10);

// Use message acknowledgment
channel.consume(queue, msg => {
  // Process message
  channel.ack(msg);
});
```

---

## Multi-Zone Deployment

### Deploy across multiple geographic regions

```
┌─────────────────────────────────────────────────────────┐
│                    REGION 1 (US)                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Infrastructure: MongoDB + RabbitMQ              │   │
│  │ (192.168.1.100)                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ API Gateway + Services                          │   │
│  │ (192.168.1.101 - 104)                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    REGION 2 (EU)                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Infrastructure: MongoDB replica set             │   │
│  │ (192.168.2.100)                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ API Gateway + Services                          │   │
│  │ (192.168.2.101 - 104)                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

        ↓ (Synchronization)
        
┌─────────────────────────────────────────────────────────┐
│ Global Load Balancer                                    │
│ Route to nearest region                                 │
└─────────────────────────────────────────────────────────┘
```

### Configuration

```env
# Region 1
MONGO_URI=mongodb://admin:password@region1-mongodb:27017
RABBITMQ_URL=amqp://guest:guest@region1-rabbitmq:5672

# Region 2 (with replica set)
MONGO_URI=mongodb://admin:password@region1-mongodb:27017,region2-mongodb:27017/movie_db?replicaSet=rs0
```

---

## Monitoring & Alerting

### Health Check Endpoints

```bash
# API Gateway status
GET http://api-gateway:8080/api/services/status

# Individual service status
GET http://user-service-1:8081/health
GET http://movie-service-1:8082/health
GET http://booking-service-1:8083/health
```

### Metrics to Monitor

1. **Response Time**: Average request latency per service
2. **Error Rate**: 5xx errors / total requests
3. **Throughput**: Requests per second
4. **CPU/Memory**: Resource utilization
5. **Database Connections**: Active connections
6. **Queue Depth**: RabbitMQ message queue size

### Alerting Rules

```
IF response_time > 1000ms THEN alert "Slow Service"
IF error_rate > 5% THEN alert "High Error Rate"
IF cpu_usage > 80% THEN alert "CPU High"
IF memory_usage > 85% THEN alert "Memory Full"
```

---

## Disaster Recovery

### Database Backup

```bash
# Backup MongoDB
mongodump --uri "mongodb://admin:password@localhost:27017" \
  --archive=backup.archive

# Restore
mongorestore --uri "mongodb://admin:password@localhost:27017" \
  --archive=backup.archive
```

### Service Recovery

```bash
# If API Gateway fails
docker restart api-gateway

# If a service fails
docker restart user-service-1

# If all fail, rebuild
docker-compose down
docker-compose up -d
```

### Failover Strategy

For high availability:

1. **Run multiple instances** of each service
2. **Use health checks** to detect failures
3. **Auto-restart** failed containers
4. **Load balance** across healthy instances
5. **Monitor** and alert on failures

---

## Cost Optimization

### Cloud Deployment

#### AWS Example

```yaml
# Using AWS ECS
LoadBalancer: $20/month
API Gateway: $3.5M requests × $0.35 = varies
EC2 Instances (t3.medium × 6): ~$300/month
RDS MongoDB: ~$200/month
ElastiCache (Redis): ~$50/month
Data Transfer: varies

Total: ~$600-1000/month (estimates)
```

#### Azure Example

```yaml
# Using Azure Container Instances
Container Instances: $0.0000347/s
App Service Plans: $10-100/month
Cosmos DB: ~$150/month
Cache (Redis): ~$50/month

Total: ~$300-500/month (estimates)
```

### Cost Reduction Tips

1. Use spot/preemptible instances for non-critical workloads
2. Enable autoscaling instead of fixed capacity
3. Cache aggressively to reduce database queries
4. Use CDN for static assets
5. Compress responses with gzip
6. Monitor and remove unused resources

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: Horizontal scaling of services
- ✅ **Reliability**: Health checks and recovery
- ✅ **Maintainability**: Independent service deployment
- ✅ **Performance**: Load balancing and caching
- ✅ **Flexibility**: Support for multi-machine and cloud deployments

For production deployments, consider adding:
- Service mesh (Istio, Linkerd)
- API management (Kong, Apigee)
- Observability (Prometheus, Grafana, ELK)
- Security (OAuth2, mTLS)
