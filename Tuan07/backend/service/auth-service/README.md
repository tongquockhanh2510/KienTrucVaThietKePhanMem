# Auth Service

## Run locally

1. Start required databases:

```bash
docker compose -f compose.yaml up -d
```

2. Install dependencies:

```bash
npm install
```

3. Run service:

```bash
npm run start:dev
```

## Environment variables

Create `.env` (already prepared in this workspace) with:

```env
DATABASE_URL_MARIA="mysql://root:123456@localhost:3307/soccial_media"
JWT_SECRET="dev-secret-key"
PORT=3001
```

MariaDB in `compose.yaml` is exposed on host port `3307` to avoid conflicts with any existing local MySQL/MariaDB on `3306`.
