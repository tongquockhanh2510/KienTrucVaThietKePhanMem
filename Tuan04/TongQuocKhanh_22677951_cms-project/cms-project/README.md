# CMS — Node.js + React + MySQL (HeidiSQL)

## Tech Stack
- **Backend**: Node.js + Express + mysql2
- **Frontend**: React 18 + React Router
- **Database**: MySQL / MariaDB
- **DB GUI**: HeidiSQL

---

## 1. Setup Database với HeidiSQL

1. Cài MySQL hoặc MariaDB
2. Mở **HeidiSQL** → New Session:
   - Host: `127.0.0.1`
   - User: `root`
   - Password: (your password)
   - Port: `3306`
3. Kết nối xong → **File → Run SQL file**
4. Chọn file `database/schema.sql` → Execute
5. Database `cms_db` và tất cả tables sẽ được tạo tự động

---

## 2. Chạy Backend

```bash
cd backend
npm install
cp .env.example .env
# Sửa .env: điền DB_PASSWORD đúng với MySQL của bạn
npm run dev
```

Backend chạy tại: http://localhost:4000
Health check: http://localhost:4000/api/health

---

## 3. Chạy Frontend

```bash
cd frontend
npm install
npm start
```

Frontend chạy tại: http://localhost:3000

---

## 4. Login

- URL: http://localhost:3000/login
- Email: `admin@cms.local`
- Password: `admin123`

---

## API Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/auth/login | — | Đăng nhập |
| GET | /api/auth/me | Bearer | Thông tin user hiện tại |
| GET | /api/auth/users | Admin | Danh sách users |
| POST | /api/auth/register | Admin | Tạo user mới |
| GET | /api/posts | — | Danh sách bài viết |
| GET | /api/posts/:slug | — | Chi tiết bài viết |
| POST | /api/posts | Editor+ | Tạo bài viết |
| PUT | /api/posts/:id | Editor+ | Cập nhật bài viết |
| DELETE | /api/posts/:id | Admin | Xoá bài viết |
| GET | /api/media | Bearer | Danh sách media |
| POST | /api/media/upload | Editor+ | Upload file |
| DELETE | /api/media/:id | Admin | Xoá file |

---

## Cấu trúc thư mục

```
cms-project/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   └── PluginRegistry.js   ← Hook system
│   │   ├── layers/
│   │   │   ├── domain/             ← Business logic
│   │   │   ├── application/        ← Middleware
│   │   │   └── presentation/       ← Routes (HTTP)
│   │   ├── plugins/
│   │   │   ├── seo/                ← Auto meta tags
│   │   │   └── cache/              ← In-memory cache
│   │   ├── config/
│   │   │   └── database.js         ← MySQL pool
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                  ← Login, Dashboard, Posts, Media, Users
│   │   ├── components/admin/       ← Layout, Sidebar
│   │   ├── services/api.js         ← Axios instance
│   │   ├── store/AuthContext.js    ← Auth state
│   │   └── App.js
│   └── package.json
└── database/
    └── schema.sql                  ← Import vào HeidiSQL
```

---

## Thêm Plugin mới

```js
// backend/src/plugins/my-plugin/index.js
const MyPlugin = {
  name: 'my-plugin',
  register(registry) {
    registry.on('before_save_post', async (ctx) => {
      // Làm gì đó trước khi lưu post
      console.log('Post sắp được lưu:', ctx.title);
    });
  },
};
module.exports = MyPlugin;

// Đăng ký trong src/index.js:
registry.register('my-plugin', require('./plugins/my-plugin'));
```
