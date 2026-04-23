# User Service - RabbitMQ Integration

User Service được xây dựng với Node.js, Express, MongoDB, RabbitMQ và JWT.

## Cụ trúc Project

```
auth-service/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── rabbitmq.js           # RabbitMQ setup
├── middleware/
│   └── auth.js               # JWT middleware
├── models/
│   └── User.js               # User schema
├── routes/
│   └── auth.js               # Auth routes
├── services/
│   └── authService.js        # Business logic
├── .env                      # Environment variables
├── app.js                    # Express app setup
├── server.js                 # Entry point
└── package.json
```

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Yêu cầu môi trường
- **Node.js**: v14+ 
- **MongoDB**: chạy local (mặc định: localhost:27017)
- **RabbitMQ**: chạy local (mặc định: localhost:5672)

### 3. Chạy MongoDB (Windows - nếu chưa cài service)
```bash
mongod
```

### 4. Chạy RabbitMQ
```bash
rabbitmq-server
```

### 5. Chạy User Service
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Service sẽ chạy trên port **3002** (có thể thay đổi trong .env)

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Hành động:** Khi user đăng ký thành công, một event `USER_REGISTERED` sẽ được publish tới RabbitMQ

### 2. Login User
**POST** `/api/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Current User (Protected Route)
**GET** `/api/auth/me`

Header:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 4. Health Check
**GET** `/health`

Response:
```json
{
  "status": "OK",
  "service": "user-service"
}
```

## RabbitMQ Event Publishing

Khi user đăng ký thành công, service sẽ publish event:

**Event Name:** `user.registered`
**Routing Key:** `user.registered`
**Exchange:** `auth_events` (topic)
**Durable:** true (message sẽ được lưu)

**Message format:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

```env
PORT=3002                                    # Server port
MONGODB_URI=mongodb://localhost:27017/user-service
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=24h                               # Token expiry
RABBITMQ_URL=amqp://localhost                # RabbitMQ connection
RABBITMQ_EXCHANGE=auth_events                # Exchange name
RABBITMQ_QUEUE=user_registered               # Queue name
NODE_ENV=development
```

## Tính năng

✅ Register API  
✅ Login API với JWT Token  
✅ Password hashing với bcryptjs  
✅ RabbitMQ event publishing  
✅ MongoDB integration  
✅ JWT authentication middleware  
✅ Input validation  
✅ Error handling  

## Notes

- JWT Secret nên được thay đổi trong production
- Passwords được hash sử dụng bcryptjs (salt rounds: 10)
- Token hết hạn sau 24 giờ (có thể thay đổi)
- RabbitMQ sẽ tự kết nối lại nếu connection bị mất
