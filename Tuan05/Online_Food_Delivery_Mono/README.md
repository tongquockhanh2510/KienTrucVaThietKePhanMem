# Online Food Delivery - Monolith

## 3 chuc nang chinh
- Quan ly mon an: them va xem danh sach mon an.
- Gio hang: them/sua/xoa mon trong gio.
- Dat hang: checkout tu gio hang va xem lich su don.

## Cong nghe
- Frontend: ReactJS + Vite (`fontend`)
- Backend: Node.js + Express + Mongoose (`backend`)
- Database: MongoDB (co the ket noi bang MongoDB Compass)

## Chay local
1. Backend:
   - Vao thu muc `backend`
   - Tao file `.env` tu `.env.example`
   - Chay:
     - `npm install`
     - `npm run dev`
2. Frontend:
   - Vao thu muc `fontend`
   - Chay:
     - `npm install`
     - `npm run dev`

- Backend mac dinh: `http://localhost:5000`
- Frontend mac dinh: `http://localhost:5173`

## MongoDB Compass
- Neu chay local MongoDB:
  - Connection string: `mongodb://127.0.0.1:27017/online_food_delivery_mono`
- Neu chay bang docker compose cua monolith:
  - Connection string: `mongodb://127.0.0.1:27017/online_food_delivery_mono`

## Chay bang Docker Compose
Tai thu muc `Online_Food_Delivery_Mono` chay:
- `docker compose up -d`

## API chinh
- `GET /api/foods`
- `POST /api/foods`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:foodId`
- `DELETE /api/cart/items/:foodId`
- `POST /api/orders/checkout`
- `GET /api/orders`
