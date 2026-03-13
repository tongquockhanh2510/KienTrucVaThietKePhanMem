const router      = require('express').Router();
const authService = require('../domain/AuthService');
const { authenticate, requireRole } = require('../application/middleware');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });
    res.json(await authService.login(email, password));
  } catch (err) { err.status = 401; next(err); }
});

router.post('/register', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    res.status(201).json(await authService.register(email, password, name, role));
  } catch (err) { next(err); }
});

router.get('/me', authenticate, (req, res) => res.json(req.user));

router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try { res.json(await authService.listUsers()); }
  catch (err) { next(err); }
});

module.exports = router;
