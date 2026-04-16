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
      const order = await orderService.getOrderById(paymentData.orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: `Order ID ${paymentData.orderId} does not exist`,
        };
      }

      // Validate amount (convert to number để so sánh)
      if (Number(paymentData.amount) !== Number(order.totalAmount)) {
        return {
          success: false,
          message: 'Invalid payment amount',
          error: `Expected ${order.totalAmount}, got ${paymentData.amount}`,
        };
      }

      // Tạo payment
      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const [result] = await connection.execute(
        `INSERT INTO \`Payment\` 
         (orderId, amount, method, status, transactionRef)
         VALUES (?, ?, ?, ?, ?)`,
        [
          paymentData.orderId,
          paymentData.amount,
          paymentData.method,
          'PENDING',
          transactionRef,
        ]
      );

      const insertId = (result as any).insertId;
      if (!insertId) {
        return {
          success: false,
          message: 'Failed to create payment',
          error: 'Insert ID not generated',
        };
      }

      const payment = await this.getPaymentById(insertId);
      if (!payment) {
        return {
          success: false,
          message: 'Failed to retrieve created payment',
          error: 'Payment not found after creation',
        };
      }

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
        console.log(`💵 CASH Payment for order #${payment.orderId}: Processing...`);
      } else if (method === 'BANKING') {
        // BANKING: Giả lập gọi bank API
        const bankingSuccess = await this.simulateBankingPayment(payment);
        paymentStatus = bankingSuccess ? 'SUCCESS' : 'FAILED';
        console.log(
          `🏦 Banking Payment for order #${payment.orderId}: ${paymentStatus}`
        );
      } else if (method === 'MOMO') {
        // MOMO: Giả lập gọi MOMO API
        const momoSuccess = await this.simulateMomoPayment(payment);
        paymentStatus = momoSuccess ? 'SUCCESS' : 'FAILED';
        console.log(
          `📱 MOMO Payment for order #${payment.orderId}: ${paymentStatus}`
        );
      }

      // Cập nhật status payment và paidAt
      const paidAt = paymentStatus === 'SUCCESS' ? new Date() : null;
      await connection.execute(
        `UPDATE \`Payment\` SET status = ?, paidAt = ? WHERE id = ?`,
        [paymentStatus, paidAt, paymentId]
      );

      // Nếu thanh toán thành công, cập nhật order status
      if (paymentStatus === 'SUCCESS') {
        const updateResult = await orderService.updateOrderStatus(
          payment.orderId,
          'CONFIRMED'
        );

        if (updateResult) {
          const order = await orderService.getOrderById(payment.orderId);
          if (order) {
            // Gửi notification
            await notificationService.sendPaymentSuccessNotification(
              order.userId,
              payment.orderId,
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
        `SELECT id, orderId, amount, method, status, transactionRef, paidAt FROM \`Payment\` WHERE id = ?`,
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
        `SELECT id, orderId, amount, method, status, transactionRef, paidAt FROM \`Payment\` WHERE orderId = ? ORDER BY id DESC`,
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
        `UPDATE \`Payment\` SET status = ? WHERE id = ?`,
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
