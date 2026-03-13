const db       = require('../../config/database');
const registry = require('../../core/PluginRegistry');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

class MediaService {
  async save(file, userId) {
    const ctx = await registry.fire('before_upload_media', { file, userId });
    const f   = ctx.file;
    const id  = uuidv4();

    await db.query(
      'INSERT INTO media (id, filename, original_name, mime_type, size, url, uploaded_by) VALUES (?,?,?,?,?,?,?)',
      [id, f.filename, f.originalname, f.mimetype, f.size, `/uploads/${f.filename}`, userId]
    );

    const { rows } = await db.query('SELECT * FROM media WHERE id = ?', [id]);
    await registry.fire('after_upload_media', { media: rows[0] });
    return rows[0];
  }

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await db.query(`
      SELECT m.*, u.name AS uploader_name
      FROM media m LEFT JOIN users u ON u.id = m.uploaded_by
      ORDER BY m.created_at DESC LIMIT ? OFFSET ?
    `, [limit, offset]);
    const { rows: c } = await db.query('SELECT COUNT(*) AS total FROM media');
    return { data: rows, total: c[0].total };
  }

  async delete(id) {
    const { rows } = await db.query('SELECT * FROM media WHERE id=?', [id]);
    if (!rows[0]) throw new Error('Media not found');
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.query('DELETE FROM media WHERE id=?', [id]);
    return rows[0];
  }
}

module.exports = new MediaService();
