import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { notificationService } from '../services/notificationService';
import { orderService } from '../services/orderService';
import { IPaymentRequest } from '../models/Payment';

export class PaymentController {
  /**
   * POST /payments
   * Tạo payment mới + xử lý thanh toán
   */
  async createAndProcessPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData: IPaymentRequest = {
        orderId: Number(req.body.orderId ?? req.body.orderid),
        amount: Number(req.body.amount),
        method: req.body.method,
      };

      // Validate input
      if (!Number.isFinite(paymentData.orderId) || !Number.isFinite(paymentData.amount)) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, amount',
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
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'Payment ID not found',
        });
        return;
      }

      const processResult = await paymentService.processPayment(
        paymentId,
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
        const order = await orderService.getOrderById(paymentData.orderId);
        if (order) {
          await notificationService.sendPaymentFailedNotification(
            order.userId,
            paymentData.orderId,
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
        const order = await orderService.getOrderById(result.data.orderId);
        if (order) {
          await notificationService.sendPaymentCancelledNotification(
            order.userId,
            result.data.orderId
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
   * GET /health
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
