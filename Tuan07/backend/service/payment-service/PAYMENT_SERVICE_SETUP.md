# Payment Service + Notification Service - Setup Hướng Dẫn

## 🎯 Mục tiêu
Xây dựng Payment Service (port 8084) với chức năng:
- Xử lý thanh toán (COD / Banking)
- Cập nhật trạng thái đơn hàng
- Gửi thông báo khi thanh toán thành công

## 📋 Yêu cầu kỹ thuật
- Node.js v16+
- TypeScript
- Express.js
- MariaDB
- Axios (gọi API service khác)
- Dotenv (biến môi trường)

---

## 🚀 Bước 1: Khởi tạo Project

### 1.1 Tạo thư mục dự án
```bash
mkdir payment-service
cd payment-service
npm init -y
```

### 1.2 Cài đặt dependencies
```bash
npm install express typescript cors dotenv axios
npm install --save-dev typescript ts-node @types/express @types/node nodemon
```

### 1.3 Tạo tsconfig.json
```bash
npx tsc --init
```

Cập nhật file `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 Cập nhật package.json
```json
{
  "name": "payment-service",
  "version": "1.0.0",
  "description": "Payment Service for Food Ordering System",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mysql2": "^3.5.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.0",
    "@types/cors": "^2.8.14",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6"
  }
}
```

---

## 📂 Bước 2: Cấu trúc Dự án

Tạo cấu trúc thư mục sau:

```
payment-service/
├── src/
│   ├── index.ts                    # Entry point
│   ├── config/
│   │   ├── database.ts             # Kết nối MariaDB
│   │   └── env.ts                  # Cấu hình môi trường
│   ├── controllers/
│   │   ├── paymentController.ts    # Xử lý payment
│   │   └── notificationController.ts # Xử lý notification
│   ├── routes/
│   │   └── paymentRoutes.ts        # Định nghĩa routes
│   ├── services/
│   │   ├── paymentService.ts       # Business logic payment
│   │   ├── orderService.ts         # Gọi Order Service
│   │   └── notificationService.ts  # Lưu & gửi notification
│   ├── models/
│   │   └── Payment.ts              # Models & Interfaces
│   ├── middleware/
│   │   └── errorHandler.ts         # Xử lý lỗi
│   └── utils/
│       └── logger.ts               # Logging
├── .env                            # Biến môi trường
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔌 Bước 3: Cấu hình Môi trường

### 3.1 Tạo file .env
```bash
# .env
NODE_ENV=development
SERVICE_NAME=Payment Service
SERVICE_PORT=8084
SERVICE_IP=192.168.1.X

# MariaDB Configuration
DB_HOST=10.62.245.189
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=food_db

# Service URLs (điều chỉnh IP theo thực tế)
ORDER_SERVICE_URL=http://192.168.1.Y:8083
USER_SERVICE_URL=http://192.168.1.Z:8081

# Payment Configuration
PAYMENT_TIMEOUT=30000

# Notification
NOTIFICATION_LOG=true
```

### 3.2 Tạo file .env.example
```bash
# .env.example
NODE_ENV=development
SERVICE_NAME=Payment Service
SERVICE_PORT=8084
SERVICE_IP=192.168.1.X

DB_HOST=10.62.245.189
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=food_db

ORDER_SERVICE_URL=http://192.168.1.Y:8083
USER_SERVICE_URL=http://192.168.1.Z:8081

PAYMENT_TIMEOUT=30000
NOTIFICATION_LOG=true
```

---

## 🗄️ Bước 4: Cấu hình Database

### 4.1 Tạo file `src/config/database.ts`

```typescript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_ordering_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Khởi tạo bảng Payment khi ứng dụng start
export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Tạo bảng Payment
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderid INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method ENUM('CASH', 'BANKING', 'MOMO') NOT NULL,
        status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
        transactionRef VARCHAR(191),
        paidAt DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orderid (orderid),
        INDEX idx_status (status)
      )
    `);

    // Tạo bảng Notification
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userid INT NOT NULL,
        orderid INT NOT NULL,
        message VARCHAR(191) NOT NULL,
        type ENUM('ORDER', 'PAYMENT', 'SYSTEM') DEFAULT 'SYSTEM',
        isRead TINYINT(1) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_userid (userid),
        INDEX idx_orderid (orderid),
        INDEX idx_isRead (isRead)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    connection.release();
  }
}

export default pool;
```

### 4.2 Tạo file `src/config/env.ts`

```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  node: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.SERVICE_PORT || '8084'),
    serviceIp: process.env.SERVICE_IP || 'localhost',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'food_ordering_system',
  },
  services: {
    orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:8083',
    userService: process.env.USER_SERVICE_URL || 'http://localhost:8081',
  },
  payment: {
    timeout: parseInt(process.env.PAYMENT_TIMEOUT || '30000'),
  },
  notification: {
    log: process.env.NOTIFICATION_LOG === 'true',
  },
};

export default config;
```

---

## 📊 Bước 5: Tạo Models

### 5.1 Tạo file `src/models/Payment.ts`

```typescript
export interface IPayment {
  id?: number;
  orderid: number;
  amount: number;
  method: 'CASH' | 'BANKING' | 'MOMO';
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionRef?: string;
  paidAt?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IPaymentRequest {
  orderid: number;
  amount: number;
  method: 'CASH' | 'BANKING' | 'MOMO';
}

export interface IPaymentResponse {
  success: boolean;
  message: string;
  data?: IPayment;
  error?: string;
}

export interface INotification {
  id?: number;
  userid: number;
  orderid: number;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
  isRead?: number;
  createdAt?: Date;
}

export interface INotificationPayload {
  userid: number;
  orderid: number;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
}

export interface IOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  items: any[];
}

export interface IUser {
  id: number;
  username: string;
  email: string;
}
```

---

## 🔧 Bước 6: Tạo Services

### 6.1 Tạo file `src/services/paymentService.ts`

```typescript
import pool from '../config/database';
import { IPayment, IPaymentRequest, IPaymentResponse } from '../models/Payment';
import { orderService } from './orderService';
import { notificationService } from './notificationService';

export class PaymentService {
  /**
   * Tạo payment mới
   */
  async createPayment(paymentData: IPaymentRequest): Promise<IPaymentResponse> {
    const connection = await pool.getConnection();
    try {
      // Validate Order
      const order = await orderService.getOrderById(paymentData.orderid);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: `Order ID ${paymentData.orderid} does not exist`,
        };
      }

      // Validate amount
      if (paymentData.amount !== order.total_amount) {
        return {
          success: false,
          message: 'Invalid payment amount',
          error: `Expected ${order.total_amount}, got ${paymentData.amount}`,
        };
      }

      // Tạo payment
      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const [result] = await connection.execute(
        `INSERT INTO payments 
         (orderid, amount, method, status, transactionRef)
         VALUES (?, ?, ?, ?, ?)`,
        [
          paymentData.orderid,
          paymentData.amount,
          paymentData.method,
          'PENDING',
          transactionRef,
        ]
      );

      const payment = await this.getPaymentById((result as any).insertId);

      return {
        success: true,
        message: 'Payment created successfully',
        data: payment,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        message: 'Failed to create payment',
        error: String(error),
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Xử lý thanh toán (CASH / BANKING / MOMO)
   */
  async processPayment(paymentId: number, method: 'CASH' | 'BANKING' | 'MOMO'): Promise<IPaymentResponse> {
    const connection = await pool.getConnection();
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: `Payment ID ${paymentId} does not exist`,
        };
      }

      if (payment.status !== 'PENDING') {
        return {
          success: false,
          message: `Payment is already ${payment.status}`,
          error: `Cannot process payment with status ${payment.status}`,
        };
      }

      let paymentStatus = 'FAILED';

      // Giả lập xử lý thanh toán
      if (method === 'CASH') {
        // CASH: Thanh toán tiền mặt, mặc định SUCCESS
        paymentStatus = 'SUCCESS';
        console.log(`💵 CASH Payment for order #${payment.orderid}: Processing...`);
      } else if (method === 'BANKING') {
        // BANKING: Giả lập gọi bank API
        const bankingSuccess = await this.simulateBankingPayment(payment);
        paymentStatus = bankingSuccess ? 'SUCCESS' : 'FAILED';
        console.log(
          `🏦 Banking Payment for order #${payment.orderid}: ${paymentStatus}`
        );
      } else if (method === 'MOMO') {
        // MOMO: Giả lập gọi MOMO API
        const momoSuccess = await this.simulateMomoPayment(payment);
        paymentStatus = momoSuccess ? 'SUCCESS' : 'FAILED';
        console.log(
          `📱 MOMO Payment for order #${payment.orderid}: ${paymentStatus}`
        );
      }

      // Cập nhật status payment và paidAt
      const paidAt = paymentStatus === 'SUCCESS' ? new Date() : null;
      await connection.execute(
        `UPDATE payments SET status = ?, paidAt = ? WHERE id = ?`,
        [paymentStatus, paidAt, paymentId]
      );

      // Nếu thanh toán thành công, cập nhật order status
      if (paymentStatus === 'SUCCESS') {
        const updateResult = await orderService.updateOrderStatus(
          payment.orderid,
          'PAID'
        );

        if (updateResult) {
          // Lấy userId từ Order (giả sử Order Service trả về user_id)
          const order = await orderService.getOrderById(payment.orderid);
          if (order) {
            // Gửi notification
            await notificationService.sendPaymentSuccessNotification(
              order.user_id,
              payment.orderid,
              payment.amount
            );
          }
        }
      }

      const updatedPayment = await this.getPaymentById(paymentId);

      return {
        success: paymentStatus === 'SUCCESS',
        message:
          paymentStatus === 'SUCCESS'
            ? 'Payment processed successfully'
            : 'Payment processing failed',
        data: updatedPayment,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: 'Failed to process payment',
        error: String(error),
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Lấy payment theo ID
   */
  async getPaymentById(paymentId: number): Promise<IPayment | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM payments WHERE id = ?`,
        [paymentId]
      );
      const payments = rows as IPayment[];
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    } finally {
      connection.release();
    }
  }

  /**
   * Lấy payments theo Order ID
   */
  async getPaymentsByOrderId(orderId: number): Promise<IPayment[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM payments WHERE orderid = ? ORDER BY created_at DESC`,
        [orderId]
      );
      return rows as IPayment[];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    } finally {
      connection.release();
    }
  }

  /**
   * Hủy payment
   */
  async cancelPayment(paymentId: number): Promise<IPaymentResponse> {
    const connection = await pool.getConnection();
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
        };
      }

      await connection.execute(
        `UPDATE payments SET status = ? WHERE id = ?`,
        ['FAILED', paymentId]
      );

      const updatedPayment = await this.getPaymentById(paymentId);

      return {
        success: true,
        message: 'Payment cancelled successfully',
        data: updatedPayment,
      };
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return {
        success: false,
        message: 'Failed to cancel payment',
        error: String(error),
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Giả lập xử lý thanh toán qua banking
   */
  private async simulateBankingPayment(payment: IPayment): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 90% thành công, 10% thất bại
        const success = Math.random() < 0.9;
        resolve(success);
      }, 1000);
    });
  }

  /**
   * Giả lập xử lý thanh toán qua MOMO
   */
  private async simulateMomoPayment(payment: IPayment): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 85% thành công, 15% thất bại
        const success = Math.random() < 0.85;
        resolve(success);
      }, 1500);
    });
  }
}

export const paymentService = new PaymentService();
```

### 6.2 Tạo file `src/services/orderService.ts`

```typescript
import axios from 'axios';
import config from '../config/env';
import { IOrder } from '../models/Payment';

export class OrderService {
  /**
   * Lấy thông tin Order từ Order Service
   */
  async getOrderById(orderId: number): Promise<IOrder | null> {
    try {
      const response = await axios.get(
        `${config.services.orderService}/orders/${orderId}`,
        { timeout: config.payment.timeout }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Cập nhật trạng thái Order
   */
  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    try {
      const response = await axios.put(
        `${config.services.orderService}/orders/${orderId}/status`,
        { status },
        { timeout: config.payment.timeout }
      );
      return response.status === 200 || (response.data && response.data.success);
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      return false;
    }
  }

  /**
   * Validate Order tồn tại
   */
  async validateOrder(orderId: number, userId: number): Promise<boolean> {
    try {
      const order = await this.getOrderById(orderId);
      return order !== null && order.user_id === userId;
    } catch (error) {
      console.error('Error validating order:', error);
      return false;
    }
  }
}

export const orderService = new OrderService();
```

### 6.3 Tạo file `src/services/notificationService.ts`

```typescript
import axios from 'axios';
import config from '../config/env';

export interface INotificationPayload {
  userid: number;
  orderid: number;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
}

export class NotificationService {
  /**
   * Gửi Notification (Lưu vào DB + Log)
   */
  async sendNotification(payload: INotificationPayload): Promise<void> {
    try {
      // Lưu vào database
      await this.saveNotification(payload);

      // Log notification
      this.logNotification(payload);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Lưu notification vào database
   */
  private async saveNotification(payload: INotificationPayload): Promise<void> {
    const pool = require('../config/database').default;
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `INSERT INTO notifications (userid, orderid, message, type, isRead, createdAt)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [payload.userid, payload.orderid, payload.message, payload.type]
      );
    } catch (error) {
      console.error('Error saving notification to database:', error);
    } finally {
      connection.release();
    }
  }

  /**
   * Log notification to console
   */
  private logNotification(payload: INotificationPayload): void {
    const timestamp = new Date().toISOString();
    const { userid, orderid, message, type } = payload;

    console.log('\n' + '='.repeat(60));
    console.log('📢 NOTIFICATION');
    console.log('='.repeat(60));
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`👤 User ID: ${userid}`);
    console.log(`📦 Order ID: ${orderid}`);
    console.log(`📝 Type: ${type}`);
    console.log(`💬 Message: ${message}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Lấy notifications của user
   */
  async getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<INotification[]> {
    const pool = require('../config/database').default;
    const connection = await pool.getConnection();

    try {
      let query = `SELECT * FROM notifications WHERE userid = ?`;
      const params: any[] = [userId];

      if (unreadOnly) {
        query += ` AND isRead = 0`;
      }

      query += ` ORDER BY createdAt DESC`;

      const [rows] = await connection.execute(query, params);
      return rows as INotification[];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    } finally {
      connection.release();
    }
  }

  /**
   * Gửi notification khi thanh toán thành công
   */
  async sendPaymentSuccessNotification(
    userId: number,
    orderId: number,
    amount: number
  ): Promise<void> {
    await this.sendNotification({
      userid: userId,
      orderid: orderId,
      message: `Payment successful for order #${orderId} - Amount: ${amount}đ`,
      type: 'PAYMENT',
    });
  }

  /**
   * Gửi notification khi thanh toán thất bại
   */
  async sendPaymentFailedNotification(
    userId: number,
    orderId: number,
    reason: string
  ): Promise<void> {
    await this.sendNotification({
      userid: userId,
      orderid: orderId,
      message: `Payment failed for order #${orderId}. Reason: ${reason}`,
      type: 'PAYMENT',
    });
  }

  /**
   * Gửi notification khi hủy thanh toán
   */
  async sendPaymentCancelledNotification(
    userId: number,
    orderId: number
  ): Promise<void> {
    await this.sendNotification({
      userid: userId,
      orderid: orderId,
      message: `Payment for order #${orderId} has been cancelled`,
      type: 'PAYMENT',
    });
  }

  /**
   * Đánh dấu notification đã đọc
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    const pool = require('../config/database').default;
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `UPDATE notifications SET isRead = 1 WHERE id = ?`,
        [notificationId]
      );
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * Đánh dấu tất cả notification của user đã đọc
   */
  async markAllAsRead(userId: number): Promise<boolean> {
    const pool = require('../config/database').default;
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `UPDATE notifications SET isRead = 1 WHERE userid = ?`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    } finally {
      connection.release();
    }
  }
}

export const notificationService = new NotificationService();
```

---

## 🎮 Bước 7: Tạo Controllers

### 7.1 Tạo file `src/controllers/paymentController.ts`

```typescript
import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { notificationService } from '../services/notificationService';
import { IPaymentRequest } from '../models/Payment';

export class PaymentController {
  /**
   * POST /payments
   * Tạo payment mới + xử lý thanh toán
   */
  async createAndProcessPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData: IPaymentRequest = req.body;

      // Validate input
      if (!paymentData.orderid || !paymentData.amount) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: orderid, amount',
        });
        return;
      }

      if (!['CASH', 'BANKING', 'MOMO'].includes(paymentData.method)) {
        res.status(400).json({
          success: false,
          message: 'Invalid method. Must be CASH, BANKING or MOMO',
        });
        return;
      }

      // Tạo payment
      const createResult = await paymentService.createPayment(paymentData);
      if (!createResult.success) {
        res.status(400).json(createResult);
        return;
      }

      // Xử lý thanh toán
      const paymentId = createResult.data?.id;
      const processResult = await paymentService.processPayment(
        paymentId!,
        paymentData.method
      );

      if (processResult.success) {
        res.status(200).json({
          success: true,
          message: 'Payment processed successfully',
          data: processResult.data,
        });
      } else {
        // Lấy thông tin user từ Order
        const order = await orderService.getOrderById(paymentData.orderid);
        if (order) {
          await notificationService.sendPaymentFailedNotification(
            order.user_id,
            paymentData.orderid,
            'Payment processing failed'
          );
        }

        res.status(400).json(processResult);
      }
    } catch (error) {
      console.error('Error in createAndProcessPayment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * GET /payments/:id
   * Lấy thông tin payment
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await paymentService.getPaymentById(paymentId);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error('Error in getPayment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * GET /payments/order/:orderId
   * Lấy danh sách payment của order
   */
  async getPaymentsByOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.orderId);
      const payments = await paymentService.getPaymentsByOrderId(orderId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error('Error in getPaymentsByOrder:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * POST /payments/:id/cancel
   * Hủy payment
   */
  async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      const result = await paymentService.cancelPayment(paymentId);

      if (result.data) {
        // Lấy thông tin user từ Order
        const order = await orderService.getOrderById(result.data.orderid);
        if (order) {
          await notificationService.sendPaymentCancelledNotification(
            order.user_id,
            result.data.orderid
          );
        }
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in cancelPayment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * GET /payments/health
   * Health check
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Payment Service is running',
      timestamp: new Date().toISOString(),
    });
  }
}

export const paymentController = new PaymentController();
```

---

## � Bước 7.2: Tạo file `src/controllers/notificationController.ts`

```typescript
import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export class NotificationController {
  /**
   * GET /notifications/user/:userId
   * Lấy danh sách notification của user
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const unreadOnly = req.query.unread === 'true';

      const notifications = await notificationService.getUserNotifications(
        userId,
        unreadOnly
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * POST /notifications/:id/read
   * Đánh dấu notification đã đọc
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await notificationService.markAsRead(notificationId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Notification marked as read',
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to mark notification as read',
        });
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }

  /**
   * POST /notifications/user/:userId/read-all
   * Đánh dấu tất cả notification của user đã đọc
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const success = await notificationService.markAllAsRead(userId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'All notifications marked as read',
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to mark notifications as read',
        });
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: String(error),
      });
    }
  }
}

export const notificationController = new NotificationController();
```

---

### 8.1 Tạo file `src/routes/paymentRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { paymentController } from '../controllers/paymentController';
import { notificationController } from '../controllers/notificationController';

const router = Router();

/**
 * Payment Routes
 */

// Health check
router.get('/health', (req: Request, res: Response) =>
  paymentController.healthCheck(req, res)
);

// Tạo payment mới + xử lý thanh toán
router.post('/payments', (req: Request, res: Response) =>
  paymentController.createAndProcessPayment(req, res)
);

// Lấy thông tin payment theo ID
router.get('/payments/:id', (req: Request, res: Response) =>
  paymentController.getPayment(req, res)
);

// Lấy danh sách payment của order
router.get('/payments/order/:orderId', (req: Request, res: Response) =>
  paymentController.getPaymentsByOrder(req, res)
);

// Hủy payment
router.post('/payments/:id/cancel', (req: Request, res: Response) =>
  paymentController.cancelPayment(req, res)
);

/**
 * Notification Routes
 */

// Lấy danh sách notification của user
router.get('/notifications/user/:userId', (req: Request, res: Response) =>
  notificationController.getUserNotifications(req, res)
);

// Đánh dấu notification đã đọc
router.post('/notifications/:id/read', (req: Request, res: Response) =>
  notificationController.markAsRead(req, res)
);

// Đánh dấu tất cả notification của user đã đọc
router.post('/notifications/user/:userId/read-all', (req: Request, res: Response) =>
  notificationController.markAllAsRead(req, res)
);

export default router;
```

---

## 🔧 Bước 9: Tạo Middleware

### 9.1 Tạo file `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', err.message);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
}
```

---

## 📝 Bước 10: Tạo Main Entry Point

### 10.1 Tạo file `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/env';
import { initializeDatabase } from './config/database';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: ['http://localhost:3000', `http://${config.node.serviceIp}:3000`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
app.use('/', paymentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Khởi tạo Application
async function startServer() {
  try {
    // Khởi tạo database
    await initializeDatabase();

    // Bắt đầu server
    const port = config.node.port;
    const host = '0.0.0.0'; // Lắng nghe từ tất cả network interfaces

    app.listen(port, host, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Payment Service Started!');
      console.log('='.repeat(60));
      console.log(`📌 Service Name: ${config.node.env.toUpperCase()} - ${config.node.env}`);
      console.log(`🌐 Server: http://0.0.0.0:${port}`);
      console.log(`🔗 Accessible via: http://${config.node.serviceIp}:${port}`);
      console.log(`🗄️  Database: ${config.database.name}@${config.database.host}`);
      console.log(`📞 Order Service: ${config.services.orderService}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Payment Service...');
  process.exit(0);
});
```

---

## 🧪 Bước 11: Testing API

### 11.1 Tạo file test với Postman/cURL

#### Test 1: Health Check
```bash
curl -X GET http://192.168.1.X:8084/health
```

#### Test 2: Tạo Payment (CASH)
```bash
curl -X POST http://192.168.1.X:8084/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderid": 1,
    "amount": 150000,
    "method": "CASH"
  }'
```

#### Test 3: Tạo Payment (BANKING)
```bash
curl -X POST http://192.168.1.X:8084/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderid": 2,
    "amount": 200000,
    "method": "BANKING"
  }'
```

#### Test 4: Tạo Payment (MOMO)
```bash
curl -X POST http://192.168.1.X:8084/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderid": 3,
    "amount": 300000,
    "method": "MOMO"
  }'
```

#### Test 5: Lấy Payment
```bash
curl -X GET http://192.168.1.X:8084/payments/1
```

#### Test 6: Lấy Payment của Order
```bash
curl -X GET http://192.168.1.X:8084/payments/order/1
```

#### Test 7: Hủy Payment
```bash
curl -X POST http://192.168.1.X:8084/payments/1/cancel
```

#### Test 8: Lấy Notifications của User
```bash
curl -X GET http://192.168.1.X:8084/notifications/user/1
```

#### Test 9: Lấy Unread Notifications của User
```bash
curl -X GET "http://192.168.1.X:8084/notifications/user/1?unread=true"
```

#### Test 10: Đánh dấu 1 Notification đã đọc
```bash
curl -X POST http://192.168.1.X:8084/notifications/1/read
```

#### Test 11: Đánh dấu tất cả Notifications đã đọc
```bash
curl -X POST http://192.168.1.X:8084/notifications/user/1/read-all
```

---

## 📦 Bước 12: Build & Deploy

### 12.1 Build Project
```bash
npm run build
```

### 12.2 Chạy Development Mode
```bash
npm run dev
```

### 12.3 Chạy Production Mode
```bash
npm run build
npm start
```

### 12.4 Chạy với Nodemon (Auto-reload)
```bash
npm run dev
```

---

## � Bước 13 (Optional): Kết nối tới Database Sẵn Có

Nếu database `food_db` đã được tạo sẵn trên server **10.62.245.189**, bạn có thể bỏ qua phần khởi tạo bảng trong step này.

### 13.1 Kiểm tra kết nối MariaDB

```bash
# Sử dụng MySQL CLI (nếu có)
mysql -h 10.62.245.189 -u root -p123456 food_db

# Hoặc kiểm tra bằng Node.js
node -e "
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '10.62.245.189',
  user: 'root',
  password: '123456',
  database: 'food_db'
});
pool.getConnection().then(conn => {
  console.log('✅ Connected to database successfully');
  conn.release();
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
});
"
```

### 13.2 Verify Bảng Payment đã tồn tại

```sql
SHOW TABLES;
DESC payments;
```

Nếu bảng `payments` chưa tồn tại, service sẽ tự động tạo khi khởi động.

---

## 🔌 Bước 14: Cấu hình CORS & IP LAN

### 14.1 Tìm IP máy của bạn

**Windows:**
```bash
ipconfig
```
Tìm "IPv4 Address" trong kết quả (thường là 192.168.1.X hoặc 192.168.0.X)

**Linux/Mac:**
```bash
ifconfig
```

### 14.2 Cập nhật .env file

```bash
SERVICE_IP=192.168.1.X  # Thay X bằng IP của máy bạn
DB_HOST=10.62.245.189   # Server database
DB_USER=root
DB_PASSWORD=123456
DB_NAME=food_db

# Cập nhật IP service khác theo thực tế
ORDER_SERVICE_URL=http://192.168.1.Y:8083
USER_SERVICE_URL=http://192.168.1.Z:8081
```

### 14.3 Kiểm tra kết nối giữa các service

```bash
# Kiểm tra tới Order Service
curl -i http://192.168.1.Y:8083/health

# Kiểm tra tới User Service
curl -i http://192.168.1.Z:8081/health
```

---

## ⚠️ Xử lý Lỗi Thường Gặp

### Lỗi: "ECONNREFUSED"
- **Nguyên nhân**: Không kết nối được tới Order Service
- **Giải pháp**: 
  - Kiểm tra Order Service đang chạy
  - Kiểm tra IP trong .env có đúng không
  - Kiểm tra firewall cho phép port 8083

### Lỗi: "ER_ACCESS_DENIED_ERROR"
- **Nguyên nhân**: Sai mật khẩu MariaDB hoặc user không tồn tại
- **Giải pháp**: 
  - Kiểm tra DB_HOST trong .env có phải 10.62.245.189
  - Kiểm tra DB_USER có phải root
  - Kiểm tra DB_PASSWORD có phải 123456
  - Kiểm tra database food_db đã được tạo chưa

### Lỗi: "CORS Error"
- **Nguyên nhân**: Frontend gọi từ origin không được phép
- **Giải pháp**: Thêm origin vào mảng `cors()` trong index.ts

### Lỗi: Database không khởi tạo
- **Nguyên nhân**: MariaDB chưa chạy, database chưa tạo, hoặc lỗi kết nối
- **Giải pháp**: 
  ```sql
  CREATE DATABASE IF NOT EXISTS food_db;
  ```
  - Kiểm tra connection: `mysql -h 10.62.245.189 -u root -p123456`
  - Verify database: `SHOW DATABASES;`

---

## 📋 API Documentation

### Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Health check service |
| POST | `/payments` | Tạo payment + xử lý thanh toán |
| GET | `/payments/:id` | Lấy thông tin payment |
| GET | `/payments/order/:orderId` | Lấy payment theo order |
| POST | `/payments/:id/cancel` | Hủy payment |
| GET | `/notifications/user/:userId` | Lấy notifications của user |
| POST | `/notifications/:id/read` | Đánh dấu 1 notification đã đọc |
| POST | `/notifications/user/:userId/read-all` | Đánh dấu tất cả notifications đã đọc |

### Request Body (POST /payments)

```json
{
  "orderid": 1,
  "amount": 150000,
  "method": "CASH"
}
```

### Response Format

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": 1,
    "orderid": 1,
    "amount": 150000,
    "method": "CASH",
    "status": "SUCCESS",
    "transactionRef": "TXN-1234567890-abc123",
    "paidAt": "2024-04-10T10:30:05.000Z",
    "created_at": "2024-04-10T10:30:00.000Z",
    "updated_at": "2024-04-10T10:30:05.000Z"
  }
}
```

### GET /notifications/user/:userId Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userid": 1,
      "orderid": 1,
      "message": "Payment successful for order #1 - Amount: 150000đ",
      "type": "PAYMENT",
      "isRead": 0,
      "createdAt": "2024-04-10T10:30:05.000Z"
    },
    {
      "id": 2,
      "userid": 1,
      "orderid": 1,
      "message": "Your order #1 has been confirmed",
      "type": "ORDER",
      "isRead": 1,
      "createdAt": "2024-04-10T10:25:00.000Z"
    }
  ]
}
```

---

## 🎯 Checklist Hoàn Thành

- [ ] ✅ Cài đặt dependencies
- [ ] ✅ Tạo cấu trúc thư mục
- [ ] ✅ Cấu hình .env
- [ ] ✅ Tạo database schema (Payment + Notification)
- [ ] ✅ Tạo models & interfaces
- [ ] ✅ Tạo services (Payment, Order, Notification)
- [ ] ✅ Tạo controllers (Payment + Notification)
- [ ] ✅ Tạo routes (Payment + Notification)
- [ ] ✅ Tạo middleware
- [ ] ✅ Test API endpoints
- [ ] ✅ Cấu hình CORS & IP LAN
- [ ] ✅ Kiểm tra kết nối giữa services

---

## 📖 Tài liệu Tham Khảo

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [MariaDB Documentation](https://mariadb.com/docs/)
- [Axios Documentation](https://axios-http.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 💡 Ghi Chú

- Service chạy trên port **8084**
- Database: **food_db** trên server **10.62.245.189**
- Payment methods: **CASH**, **BANKING**, **MOMO**
- Notification types: **ORDER**, **PAYMENT**, **SYSTEM**
- Sử dụng **Async/Await** cho tất cả database operations
- Mỗi connection tự động release về pool
- Notifications được lưu vào database + log ra console
- Xử lý lỗi chuẩn với try-catch

### Notification Model Chi Tiết:
- **id**: AUTO_INCREMENT PRIMARY KEY
- **userid**: User ID của người nhận notification
- **orderid**: Order ID liên quan
- **message**: Nội dung notification (VARCHAR 191)
- **type**: ENUM['ORDER', 'PAYMENT', 'SYSTEM']
  - ORDER: Thông báo về đơn hàng
  - PAYMENT: Thông báo về thanh toán
  - SYSTEM: Thông báo hệ thống
- **isRead**: 0 (chưa đọc) / 1 (đã đọc) - Default: 0
- **createdAt**: Thời gian tạo notification

---

**Chúc bạn thành công! 🎉**

Nếu có thắc mắc hoặc cần giúp đỡ, hãy liên hệ nhóm phát triển!
