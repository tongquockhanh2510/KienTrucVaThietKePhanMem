import { Router } from 'express';
import { NotificationModel } from '../models/Notification';
import { PaymentModel } from '../models/Payment';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'payment-notification-service',
    timestamp: new Date().toISOString(),
  });
});

router.get('/payments', async (_req, res, next) => {
  try {
    const payments = await PaymentModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

router.get('/payments/booking/:bookingId', async (req, res, next) => {
  try {
    const payment = await PaymentModel.findOne({ bookingId: req.params.bookingId })
      .sort({ createdAt: -1 })
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for this booking' });
    }

    return res.json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
});

router.get('/notifications', async (_req, res, next) => {
  try {
    const notifications = await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

export default router;
