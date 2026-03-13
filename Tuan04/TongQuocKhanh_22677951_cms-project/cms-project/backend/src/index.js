require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const registry   = require('./core/PluginRegistry');
registry.register('seo',   require('./plugins/seo'));
registry.register('cache', require('./plugins/cache'));

const { errorHandler } = require('./layers/application/middleware');
const app = express();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', plugins: registry.listPlugins(), time: new Date() })
);

app.use('/api/auth',  require('./layers/presentation/authRoutes'));
app.use('/api/posts', require('./layers/presentation/postRoutes'));
app.use('/api/media', require('./layers/presentation/mediaRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 CMS Backend → http://localhost:${PORT}`);
  console.log(`📦 Plugins: ${registry.listPlugins().join(', ')}\n`);
});
