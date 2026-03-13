const CachePlugin = {
  name: 'cache',
  _store: new Map(),
  _ttl:   new Map(),
  TTL: 5 * 60 * 1000,

  register(registry) {
    registry.on('after_save_post',   this._bust.bind(this), 10);
    registry.on('after_update_post', this._bust.bind(this), 10);
    registry.on('after_delete_post', this._bust.bind(this), 10);
    console.log('[Cache Plugin] registered');
  },

  set(key, val, ttl = this.TTL) {
    this._store.set(key, val);
    this._ttl.set(key, Date.now() + ttl);
  },

  get(key) {
    if (!this._store.has(key)) return null;
    if (Date.now() > this._ttl.get(key)) { this._store.delete(key); return null; }
    return this._store.get(key);
  },

  flush(prefix) {
    for (const k of this._store.keys())
      if (!prefix || k.startsWith(prefix)) this._store.delete(k);
  },

  async _bust(ctx) {
    this.flush('posts:');
    if (ctx.post?.slug) this._store.delete(`post:${ctx.post.slug}`);
  },
};
module.exports = CachePlugin;
