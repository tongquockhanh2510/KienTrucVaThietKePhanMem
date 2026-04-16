# Deploy 4 Services on 4 Machines

## Suggested topology

- Machine A (Gateway): `192.168.1.100` -> `api-gateway` on port `8080`
- Machine B (Auth): `192.168.1.101` -> `auth-service` on port `8081`
- Machine C (Food): `192.168.1.102` -> `food-service` on port `8082`
- Machine D (Order): `192.168.1.103` -> `order-service` on port `8083`
- Optional Machine E (Payment): `192.168.1.104` -> `payment-service` on port `8084`
- Database host: `192.168.1.200:3306`

## 1) Configure environment files

Copy each `.env.example` to `.env` and adjust IPs:

- `api-gateway/.env.example`
- `service/auth-service/.env.example`
- `service/food-service/.env.example`
- `service/order-service/.env.example`
- `service/payment-service/.env.example`

## 2) Open firewall ports

Open inbound TCP ports on each machine:

- 8080 for gateway
- 8081 for auth
- 8082 for food
- 8083 for order
- 8084 for payment

Also allow DB port `3306` on DB host for service machines.

## 3) Start services

Start each service in its own machine:

```bash
# gateway
cd backend/api-gateway
npm install
npm run build
npm run start:dev

# auth
cd backend/service/auth-service
npm install
npm run prisma:generate
npm run start:dev

# food
cd backend/service/food-service
npm install
npm run start

# order
cd backend/service/order-service
npm install
npm run build
npm run dev

# payment
cd backend/service/payment-service
npm install
npm run build
npm run dev
```

## 4) Smoke tests

From Machine A (gateway machine):

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/food
curl -X POST http://127.0.0.1:8080/auth/introspect -H "Content-Type: application/json" -d "{\"token\":\"test\"}"
```

## Troubleshooting

- If gateway cannot call service: verify service IP/port in gateway `.env` and firewall.
- If auth build fails with Prisma rename/EPERM: stop running auth node process, then run `npm run prisma:generate` again.
- If DB auth fails: verify `DB_HOST/DB_USER/DB_PASSWORD` (or `DATABASE_URL_MARIA`) and DB grants.
