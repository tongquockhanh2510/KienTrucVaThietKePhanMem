# Testing API

Hướng dẫn test API sử dụng cURL hoặc Postman

## Chuẩn bị

1. Đảm bảo MongoDB đang chạy
2. Đảm bảo RabbitMQ đang chạy
3. Chạy User Service: `npm run dev`

## Test Cases

### 1. Register User

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com"
  }
}
```

### 2. Login User

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com"
  }
}
```

### 3. Get Current User (Protected)

```bash
# Replace <token> with actual JWT token from login/register response
curl -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com"
  }
}
```

### 4. Health Check

```bash
curl http://localhost:3002/health
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "service": "user-service"
}
```

## Error Cases

### Register - Duplicate Email
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user2",
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

### Login - Invalid Credentials
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "wrongpassword"
  }'
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Protected Route - No Token
```bash
curl http://localhost:3002/api/auth/me
```

**Response (401):**
```json
{
  "success": false,
  "message": "No authorization token"
}
```

## Postman Configuration

### Create Collection: User Service

#### Request 1: Register
- **Method:** POST
- **URL:** `http://localhost:3002/api/auth/register`
- **Headers:** Content-Type: application/json
- **Body:**
```json
{
  "username": "postman_user",
  "email": "postman@example.com",
  "password": "password123"
}
```

#### Request 2: Login
- **Method:** POST
- **URL:** `http://localhost:3002/api/auth/login`
- **Headers:** Content-Type: application/json
- **Body:**
```json
{
  "email": "postman@example.com",
  "password": "password123"
}
```

#### Request 3: Get Me
- **Method:** GET
- **URL:** `http://localhost:3002/api/auth/me`
- **Headers:** 
  - Authorization: Bearer {{token}} (set from login response)

## RabbitMQ Event Verification

Khi register thành công, kiểm tra event được publish:

```bash
# Using RabbitMQ Management UI
# Vào http://localhost:15672
# Username: guest
# Password: guest
# Kiểm tra exchange: auth_events
# Kiểm tra messages trong queue: user_registered
```

## Server Logs

Khi có event được publish, bạn sẽ thấy trong terminal:

```
Event published: user.registered {
  userId: '...',
  username: 'user1',
  email: 'user1@example.com',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```
