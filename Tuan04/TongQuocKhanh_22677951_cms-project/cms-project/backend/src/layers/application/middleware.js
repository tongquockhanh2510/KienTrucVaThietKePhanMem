const authService = require('../domain/AuthService');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided' });
    const payload = authService.verifyToken(header.split(' ')[1]);
    req.user = await authService.getById(payload.id);
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = { authenticate, requireRole, errorHandler };
