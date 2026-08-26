const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
