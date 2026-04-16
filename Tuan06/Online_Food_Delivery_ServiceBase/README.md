# Online Food Delivery - Service Base

## 3 chuc nang chinh
- Quan ly mon an (`menu-service`)
- Gio hang (`cart-service`)
- Dat hang (`order-service`)

Tat ca duoc truy cap thong qua `gateway`.

## Cong nghe
- Frontend: ReactJS + Vite (`fontend`)
- Backend: Node.js + Express (microservices)
- Database: MongoDB (MongoDB Compass)

## Kien truc
- `backend/gateway`: API gateway, route den cac service.
- `backend/services/menu-service`: quan ly mon an.
- `backend/services/cart-service`: quan ly gio hang.
- `backend/services/order-service`: checkout va lich su don.

## Chay local
1. Menu service (port 6001)
2. Cart service (port 6002)
3. Order service (port 6003)
4. Gateway (port 6000)
5. Frontend (port 5174)

Moi service tao file `.env` tu `.env.example`, sau do:
- `npm install`
- `npm run dev`

## MongoDB Compass
- Neu chay local khong docker:
  - `mongodb://127.0.0.1:27017/ofd_menu_service`
  - `mongodb://127.0.0.1:27017/ofd_cart_service`
  - `mongodb://127.0.0.1:27017/ofd_order_service`

- Neu chay docker compose service-base:
  - Mongo expose ra host port `27018`
  - Connection string:
    - `mongodb://127.0.0.1:27018/ofd_menu_service`
    - `mongodb://127.0.0.1:27018/ofd_cart_service`
    - `mongodb://127.0.0.1:27018/ofd_order_service`

## Chay bang Docker Compose
Tai thu muc `Online_Food_Delivery_ServiceBase` chay:
- `docker compose up -d`

Frontend goi API gateway qua:
- `http://localhost:8000/api`
