const notificationService = require('../services/notificationService');

class NotificationController {
  async listNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.id);
      return res.status(200).json({
        success: true,
        data: { notifications }
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data: { notification: updated }
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async clearNotifications(req, res, next) {
    try {
      const result = await notificationService.clearNotifications(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications cleared.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
