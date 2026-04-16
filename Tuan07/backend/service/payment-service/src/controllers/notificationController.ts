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
