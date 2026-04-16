# Payment Service - Food Ordering System

Payment Service Backend API sử dụng Node.js, TypeScript, Express, và MariaDB.

## 🎯 Chức năng

- Xử lý thanh toán (CASH, BANKING, MOMO)
- Cập nhật trạng thái đơn hàng
- Gửi thông báo khi thanh toán thành công
- Quản lý notifications

## 🚀 Cài đặt nhanh

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình .env
```bash
cp .env.example .env
# Sửa các giá trị trong .env
```

### 3. Chạy development mode
```bash
npm run dev
```

### 4. Build & Production
```bash
npm run build
npm start
```

## 📚 API Documentation

### Payments
- `POST /payments` - Tạo payment + xử lý thanh toán
- `GET /payments/:id` - Lấy thông tin payment
- `GET /payments/order/:orderId` - Lấy payments của order
- `POST /payments/:id/cancel` - Hủy payment

### Notifications
- `GET /notifications/user/:userId` - Lấy notifications
- `POST /notifications/:id/read` - Đánh dấu đã đọc
- `POST /notifications/user/:userId/read-all` - Đánh dấu tất cả đã đọc

## 📋 Structure

```
payment-service/
├── src/
│   ├── index.ts
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── dist/
├── .env
└── package.json
```

## 🔧 Biến môi trường

Xem file `.env.example` để biết chi tiết các biến cấu hình.

- `DB_HOST`: Địa chỉ server MariaDB
- `DB_PASSWORD`: Mật khẩu MariaDB
- `DB_NAME`: Tên database
- `SERVICE_PORT`: Port chạy service (8084)
- `SERVICE_IP`: IP máy của bạn

## 💡 Testing

Sử dụng curl hoặc Postman để test các API endpoints.

```bash
# Health check
curl -X GET http://localhost:8084/health

# Tạo payment
curl -X POST http://localhost:8084/payments \
  -H "Content-Type: application/json" \
  -d '{"orderid":1,"amount":150000,"method":"CASH"}'
```

---

**Được tạo cho đề bài: Mini Food Ordering System - Service-Based Architecture**
