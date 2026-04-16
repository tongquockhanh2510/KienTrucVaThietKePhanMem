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
