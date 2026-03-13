const db       = require('../../config/database');
const registry = require('../../core/PluginRegistry');
const slugify  = require('slugify');
const { v4: uuidv4 } = require('uuid');

class PostService {
  async findAll({ status, page = 1, limit = 10, authorId } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params     = [];

    if (status)   { conditions.push('p.status = ?');    params.push(status); }
    if (authorId) { conditions.push('p.author_id = ?'); params.push(authorId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await db.query(`
      SELECT p.*,
             u.name  AS author_name,
             u.email AS author_email,
             IFNULL(GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ','), '') AS tags
      FROM   posts p
      LEFT JOIN users     u  ON u.id  = p.author_id
      LEFT JOIN post_tags pt ON pt.post_id = p.id
      LEFT JOIN tags      t  ON t.id  = pt.tag_id
      ${where}
      GROUP BY p.id, u.name, u.email
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const { rows: countRows } = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total FROM posts p ${where}`, params
    );
    const total = countRows[0]?.total || 0;

    // Parse tags string → array
    const data = rows.map(r => ({
      ...r,
      tags: r.tags ? r.tags.split(',') : [],
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta || '{}') : (r.meta || {}),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug) {
    const { rows } = await db.query(`
      SELECT p.*,
             u.name AS author_name,
             IFNULL(GROUP_CONCAT(t.name SEPARATOR ','), '') AS tags
      FROM   posts p
      LEFT JOIN users     u  ON u.id = p.author_id
      LEFT JOIN post_tags pt ON pt.post_id = p.id
      LEFT JOIN tags      t  ON t.id = pt.tag_id
      WHERE p.slug = ?
      GROUP BY p.id, u.name
    `, [slug]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      tags: rows[0].tags ? rows[0].tags.split(',') : [],
      meta: typeof rows[0].meta === 'string' ? JSON.parse(rows[0].meta || '{}') : (rows[0].meta || {}),
    };
  }

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data, authorId) {
    const { title, content, excerpt, status = 'draft', meta = {}, tags = [] } = data;

    if (status === 'published' && (!title || !content)) {
      throw new Error('Published posts require title and content');
    }

    const slug = await this._generateSlug(title);

    const ctx = await registry.fire('before_save_post', {
      title, content, excerpt, status, meta, slug, authorId,
    });

    const publishedAt = ctx.status === 'published' ? new Date() : null;
    const id = uuidv4();

    await db.query(`
      INSERT INTO posts (id, title, slug, content, excerpt, status, author_id, meta, published_at)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [id, ctx.title, ctx.slug, ctx.content, ctx.excerpt,
        ctx.status, authorId, JSON.stringify(ctx.meta), publishedAt]);

    const post = await this.findById(id);

    if (tags.length) await this._saveTags(id, tags);
    await registry.fire('after_save_post', { post });
    return post;
  }

  async update(id, data, userId) {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Post not found');

    const updates = { ...existing, ...data };
    if (data.title && data.title !== existing.title) {
      updates.slug = await this._generateSlug(data.title, id);
    }

    const ctx = await registry.fire('before_update_post', { updates, existing });
    const u   = ctx.updates;
    const publishedAt = u.status === 'published' && !existing.published_at
      ? new Date() : existing.published_at;

    await db.query(`
      UPDATE posts SET title=?, slug=?, content=?, excerpt=?,
        status=?, meta=?, published_at=?, updated_at=NOW()
      WHERE id=?
    `, [u.title, u.slug, u.content, u.excerpt,
        u.status, JSON.stringify(u.meta || {}), publishedAt, id]);

    if (data.tags !== undefined) {
      await db.query('DELETE FROM post_tags WHERE post_id = ?', [id]);
      if (data.tags.length) await this._saveTags(id, data.tags);
    }

    const post = await this.findById(id);
    await registry.fire('after_update_post', { post });
    return post;
  }

  async delete(id) {
    await registry.fire('before_delete_post', { id });
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    await registry.fire('after_delete_post', { id });
  }

  async _generateSlug(title, excludeId = null) {
    let base = slugify(title, { lower: true, strict: true });
    let slug = base, i = 1;
    while (true) {
      const sql    = excludeId
        ? 'SELECT id FROM posts WHERE slug=? AND id!=?'
        : 'SELECT id FROM posts WHERE slug=?';
      const params = excludeId ? [slug, excludeId] : [slug];
      const { rows } = await db.query(sql, params);
      if (!rows.length) break;
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async _saveTags(postId, tagNames) {
    for (const name of tagNames) {
      const slug = slugify(name, { lower: true });
      const id   = uuidv4();
      await db.query(
        'INSERT INTO tags (id, name, slug) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [id, name, slug]
      );
      const { rows } = await db.query('SELECT id FROM tags WHERE slug=?', [slug]);
      await db.query(
        'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)',
        [postId, rows[0].id]
      );
    }
  }
}

module.exports = new PostService();
