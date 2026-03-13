const router      = require('express').Router();
const postService = require('../domain/PostService');
const { authenticate, requireRole } = require('../application/middleware');

router.get('/', async (req, res, next) => {
  try {
    const { status = 'published', page = 1, limit = 10 } = req.query;
    res.json(await postService.findAll({ status, page: +page, limit: +limit }));
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const post = await postService.findBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole('admin', 'editor'), async (req, res, next) => {
  try {
    res.status(201).json(await postService.create(req.body, req.user.id));
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireRole('admin', 'editor'), async (req, res, next) => {
  try {
    res.json(await postService.update(req.params.id, req.body, req.user.id));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    await postService.delete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
