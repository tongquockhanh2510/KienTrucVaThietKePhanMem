const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db       = require('../../config/database');

class AuthService {
  async login(email, password) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');
    const token = this._sign(user);
    const { password_hash, ...safe } = user;
    return { user: safe, token };
  }

  async register(email, password, name, role = 'editor') {
    const { rows: exists } = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) throw new Error('Email already in use');
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?,?,?,?,?)',
      [id, email, hash, name, role]
    );
    const { rows } = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0];
  }

  async getById(id) {
    const { rows } = await db.query(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  async listUsers() {
    const { rows } = await db.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  _sign(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthService();
