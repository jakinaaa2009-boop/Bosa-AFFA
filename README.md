# Bosa AFFA – Урамшуулалт сугалаа (Full‑stack)

## Стек

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **DB**: MongoDB + Mongoose
- **Upload**: Multer + Cloudflare R2 (receipt image stored in R2; MongoDB stores only object key/URL)
- **Admin auth**: JWT

## Фолдер бүтэц

- `frontend/` – public кампанит сайт + admin хэсэг
- `backend/` – REST API + Mongo models + draw logic

## Тохиргоо

### 1) Backend

```bash
cd backend
copy .env.example .env
npm i
```

- MongoDB ажиллаж байх хэрэгтэй (`MONGODB_URI`).
- Receipt зураг хадгалах зориулалттай Cloudflare R2 тохируулна (`R2_*` env variables).

Асаах:

```bash
npm run dev
```

Seed (dummy data):

```bash
npm run seed
```

### 2) Frontend

```bash
cd frontend
copy .env.example .env
npm i
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

## API

- **Public**
  - `POST /api/submissions` (multipart: `receiptImage`)
  - `GET /api/winners`
- **Admin**
  - `POST /api/admin/login`
  - `GET /api/submissions` (JWT шаардлагатай)
  - `PATCH /api/submissions/:id/status` (`approved` үед `chances` — худалдан авсан барааны тоо = сугалааны эрхийн тоо)
  - `DELETE /api/submissions/:id`
  - `POST /api/draw/spin`

## Admin pages

- `http://localhost:3000/admin/login`
- `http://localhost:3000/admin/submissions`
- `http://localhost:3000/admin/draw`
- `http://localhost:3000/admin/winners`

Админ default credential нь `backend/.env` дээрх:

- `ADMIN_DEFAULT_USERNAME`
- `ADMIN_DEFAULT_PASSWORD`

Одоогийн default:

- username: `admin`
- password: `admin123`

