import pool from '../config/database';
import { INotification, INotificationPayload } from '../models/Payment';

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
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `INSERT INTO \`Notification\` (userId, orderId, message, type, isRead, createdAt)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [payload.userId, payload.orderId, payload.message, payload.type]
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
    const { userId, orderId, message, type } = payload;

    console.log('\n' + '='.repeat(60));
    console.log('📢 NOTIFICATION');
    console.log('='.repeat(60));
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📦 Order ID: ${orderId}`);
    console.log(`📝 Type: ${type}`);
    console.log(`💬 Message: ${message}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Lấy notifications của user
   */
  async getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<INotification[]> {
    const connection = await pool.getConnection();

    try {
      let query = `SELECT * FROM \`Notification\` WHERE userId = ?`;
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
      userId,
      orderId,
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
      userId,
      orderId,
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
      userId,
      orderId,
      message: `Payment for order #${orderId} has been cancelled`,
      type: 'PAYMENT',
    });
  }

  /**
   * Đánh dấu notification đã đọc
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `UPDATE \`Notification\` SET isRead = 1 WHERE id = ?`,
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
    const connection = await pool.getConnection();

    try {
      await connection.execute(
        `UPDATE \`Notification\` SET isRead = 1 WHERE userId = ?`,
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
