const db = require('../models/dbAdapter');
const { emitNotification } = require('../config/socket');

class NotificationService {
  async createNotification(data) {
    const { owner, workflowId = null, executionId = null, type = 'info', title, message } = data;
    const notification = await db.Notification.create({
      owner,
      workflowId,
      executionId,
      type,
      title,
      message,
      isRead: false
    });

    // Real-time broadcast
    emitNotification(owner, notification);

    return notification;
  }

  async getUserNotifications(userId, limit = 50) {
    return await db.Notification.find(
      { owner: userId },
      { createdAt: -1 },
      limit
    );
  }

  async markAsRead(notificationId, userId) {
    return await db.Notification.findByIdAndUpdate(notificationId, { isRead: true });
  }

  async markAllAsRead(userId) {
    const unread = await db.Notification.find({ owner: userId, isRead: false });
    for (const notif of unread) {
      await db.Notification.findByIdAndUpdate(notif._id, { isRead: true });
    }
    return { success: true, count: unread.length };
  }

  async clearNotifications(userId) {
    return await db.Notification.deleteMany({ owner: userId });
  }
}

module.exports = new NotificationService();
