const SeoPlugin = {
  name: 'seo',
  register(registry) {
    registry.on('before_save_post',   this._inject.bind(this), 5);
    registry.on('before_update_post', ctx => this._inject(ctx.updates), 5);
    console.log('[SEO Plugin] registered');
  },
  async _inject(ctx) {
    if (!ctx.meta) ctx.meta = {};
    if (!ctx.meta.description) {
      const raw = ctx.excerpt || ctx.content || '';
      ctx.meta.description = raw.replace(/<[^>]+>/g, '').substring(0, 160);
    }
    if (!ctx.meta.og_title && ctx.title)
      ctx.meta.og_title = ctx.title;
    if (!ctx.meta.canonical && ctx.slug)
      ctx.meta.canonical = `/posts/${ctx.slug}`;
  },
};
module.exports = SeoPlugin;
