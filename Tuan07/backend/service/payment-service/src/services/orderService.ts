import pool from '../config/database';
import { IOrder } from '../models/Payment';

export class OrderService {
  /**
   * Lấy thông tin Order từ database
   */
  async getOrderById(orderId: number): Promise<IOrder | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id, userId, totalAmount, status, paymentMethod
         FROM \`Order\` WHERE id = ?`,
        [orderId]
      );
      const orders = rows as any[];
      
      if (orders.length === 0) {
        return null;
      }

      return {
        id: orders[0].id,
        userId: orders[0].userId,
        totalAmount: Number(orders[0].totalAmount),
        status: orders[0].status,
        paymentMethod: orders[0].paymentMethod,
        items: [],
      };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    } finally {
      connection.release();
    }
  }

  /**
   * Cập nhật trạng thái Order trong database
   */
  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE \`Order\` SET status = ?, updatedAt = NOW() WHERE id = ?`,
        [status, orderId]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * Validate Order tồn tại
   */
  async validateOrder(orderId: number, userId: number): Promise<boolean> {
    try {
      const order = await this.getOrderById(orderId);
      return order !== null && order.userId === userId;
    } catch (error) {
      console.error('Error validating order:', error);
      return false;
    }
  }
}

export const orderService = new OrderService();
