const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
app.use(cors());

const menuServiceUrl = process.env.MENU_SERVICE_URL || 'http://localhost:6001';
const cartServiceUrl = process.env.CART_SERVICE_URL || 'http://localhost:6002';
const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:6003';

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    architecture: 'service-base',
    services: {
      menu: menuServiceUrl,
      cart: cartServiceUrl,
      order: orderServiceUrl
    }
  });
});

app.use(
  '/api',
  createProxyMiddleware({
    changeOrigin: true,
    pathRewrite: {
      '^/foods': '/api/foods',
      '^/cart': '/api/cart',
      '^/orders': '/api/orders'
    },
    router: (req) => {
      if (req.path.startsWith('/foods')) return 'http://localhost:6001';
      if (req.path.startsWith('/cart')) return 'http://localhost:6002';
      if (req.path.startsWith('/orders')) return 'http://localhost:6003';
    }
  })
);

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
  console.log(`Gateway running at http://localhost:${port}`);
});
