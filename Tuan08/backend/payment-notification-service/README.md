# Payment + Notification Service (MongoDB)

Service cho vai tro Nguoi 5 trong de bai Movie Ticket System theo Event-Driven Architecture.

## Muc tieu

- Payment service consume event `BOOKING_CREATED`
- Gia lap thanh toan random success/fail
- Publish event:
  - `PAYMENT_COMPLETED` khi thanh cong
  - `BOOKING_FAILED` khi that bai
- Notification service consume `PAYMENT_COMPLETED`
- Luu du lieu vao MongoDB va ghi log thong bao

## Cong nghe

- Node.js + TypeScript + Express
- MongoDB (mongoose)
- RabbitMQ (amqplib) lam message broker

## Cac event duoc dung

- `BOOKING_CREATED`
- `PAYMENT_COMPLETED`
- `BOOKING_FAILED`

## Cau hinh

Copy file moi truong:

```bash
cp .env.example .env
```

Bien quan trong trong `.env`:

- `SERVICE_PORT` (mac dinh 8084)
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `RABBITMQ_URL`
- `RABBITMQ_EXCHANGE`
- `EVENT_BOOKING_CREATED`
- `EVENT_PAYMENT_COMPLETED`
- `EVENT_BOOKING_FAILED`

## Chay project

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm start
```

## API monitor

- `GET /health`
- `GET /payments`
- `GET /payments/booking/:bookingId`
- `GET /notifications`

## Event payload de xuat

### BOOKING_CREATED

Publish vao channel `BOOKING_CREATED`:

```json
{
  "type": "BOOKING_CREATED",
  "bookingId": "BK123",
  "userId": "U01",
  "movieId": "M009",
  "seats": ["A1", "A2"],
  "totalPrice": 180000,
  "createdAt": "2026-04-17T10:20:00.000Z"
}
```

### PAYMENT_COMPLETED

Service se publish vao channel `PAYMENT_COMPLETED`:

```json
{
  "type": "PAYMENT_COMPLETED",
  "bookingId": "BK123",
  "userId": "U01",
  "paymentId": "...",
  "amount": 180000,
  "transactionRef": "TXN-...",
  "paidAt": "2026-04-17T10:20:03.000Z"
}
```

### BOOKING_FAILED

Service se publish vao channel `BOOKING_FAILED`:

```json
{
  "type": "BOOKING_FAILED",
  "bookingId": "BK123",
  "userId": "U01",
  "paymentId": "...",
  "amount": 180000,
  "reason": "Random payment simulation failed",
  "failedAt": "2026-04-17T10:20:03.000Z"
}
```

## Trien khai LAN

- User Service: `192.168.x.x:8081`
- Movie Service: `192.168.x.x:8082`
- Booking Service: `192.168.x.x:8083`
- Payment+Notification Service: `192.168.x.x:8084`
- Frontend: `192.168.x.x:8085`
- RabbitMQ Broker: `192.168.x.x:5672`

Service da duoc cau hinh san cho RabbitMQ trong `src/config/broker.ts`.
