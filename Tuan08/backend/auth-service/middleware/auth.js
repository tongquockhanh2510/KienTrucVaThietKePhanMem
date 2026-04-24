const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No authorization token' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    if (error.code === 'JWT_CONFIG_MISSING') {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { protect };
