# ⚡ Backend Quick Start Guide

Hướng dẫn nhanh để chạy backend trong **5 phút**.

---

## 📋 Prerequisites

- ✅ Node.js >= 18
- ✅ PostgreSQL >= 14 (đang chạy)
- ✅ Supabase account (cho file storage)

---

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 phút)

```bash
cd backend
npm install
```

### Step 2: Configure Environment (1 phút)

Tạo file `.env`:

```env
# Server
NODE_ENV=development
PORT=4000

# Database (thay bằng credentials của bạn)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dien_tu_nam_tong

# JWT (đổi secret trong production!)
JWT_SECRET=my-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Supabase (lấy từ Supabase Dashboard)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage
STORAGE_BUCKET=content
MAX_FILE_SIZE=5242880
```

### Step 3: Create Database (30 giây)

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE dien_tu_nam_tong;
\q
```

### Step 4: Start Server (30 giây)

```bash
npm run dev
```

Server chạy tại: **http://localhost:4000**

Output:
```
✅ Database connected successfully
🚀 Server Started Successfully!
📡 Port: 4000
🌍 Environment: development
```

### Step 5: Create Admin User (1 phút)

Trong terminal khác:

```bash
cd backend
npx tsx src/seeds/create-admin.ts
```

Output:
```
✅ Admin User Created Successfully!
👤 Username: admin
🔒 Password: Admin@123
```

---

## ✅ Verify Installation

### Test 1: Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-11T...",
  "environment": "development"
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "username": "admin",
      "role": "admin"
    }
  },
  "statusCode": 200
}
```

### Test 3: Protected Route

Copy token từ login response, sau đó:

```bash
curl http://localhost:4000/api/admin/product \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": [],
  "statusCode": 200
}
```

---

## 🎯 Common Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/product` | No | Get products |
| GET | `/api/admin/product` | ✅ | Get all products (admin) |
| POST | `/api/admin/product` | ✅ | Create product |

**Auth Required:** Add header `Authorization: Bearer <token>`

---

## 🔧 Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run seed scripts
npx tsx src/seeds/create-admin.ts

# TypeScript check
npx tsc --noEmit

# Database operations (TypeORM)
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run schema:sync  # ⚠️ Dev only
```

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Error: "Supabase storage not configured"

**Solution:**
1. Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Get credentials from Supabase Dashboard → Settings → API

### Error: "Cannot find module '@entities/...'"

**Solution:**
```bash
# Install tsconfig-paths for development
npm install --save-dev tsconfig-paths

# Or use tsx (already in package.json)
npm run dev
```

### Error: "Admin user already exists"

**Solution:**
Admin đã được tạo rồi! Sử dụng credentials:
- Username: `admin`
- Password: `Admin@123`

---

## 📚 Next Steps

1. ✅ **Read API Documentation**: [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)
2. ✅ **Understand Architecture**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
3. ✅ **Setup for Production**: [`DEPLOYMENT.md`](./DEPLOYMENT.md)
4. ✅ **Migration Guide**: [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)

---

## 🔐 Default Credentials

**⚠️ IMPORTANT: Change password after first login!**

- **Username:** `admin`
- **Password:** `Admin@123`
- **Role:** `admin`

Change password:
```bash
curl -X PUT http://localhost:4000/api/admin/profile/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin@123",
    "newPassword": "YourNewSecurePassword123!"
  }'
```

---

## 💡 Tips

### Auto-restart on changes

Already configured! `npm run dev` uses `tsx watch`.

### View Database Tables

```bash
psql -U postgres -d dien_tu_nam_tong

# List tables
\dt

# View product table
SELECT * FROM product;
```

### Debug Mode

Add to `.env`:
```env
NODE_ENV=development
```

This enables:
- ✅ SQL query logging
- ✅ Detailed error messages
- ✅ Auto schema sync

---

## 🎓 Learning Resources

- **TypeORM Docs**: https://typeorm.io/
- **Express Guide**: https://expressjs.com/
- **JWT Best Practices**: https://jwt.io/introduction

---

**Need Help?** Check logs or read detailed docs in other MD files.

**Ready to build?** Start creating endpoints! 🚀

