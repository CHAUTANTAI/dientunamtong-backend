# 📦 Migration Guide: JavaScript → TypeScript + TypeORM

Hướng dẫn migrate từ backend cũ (JavaScript + raw SQL) sang backend mới (TypeScript + TypeORM).

## 🎯 Tổng quan thay đổi

### Trước (Old)
- ❌ JavaScript (ES modules)
- ❌ Raw SQL queries với `pg` driver
- ❌ Plain text passwords
- ❌ No authentication middleware
- ❌ Inconsistent error handling
- ❌ Database-first approach

### Sau (New)
- ✅ TypeScript với strict mode
- ✅ TypeORM Code-First approach
- ✅ Bcrypt password hashing
- ✅ JWT authentication + middleware
- ✅ Global error handling
- ✅ Input validation với express-validator
- ✅ Clean Architecture (layers)
- ✅ Role-based access control

## 🔄 Migration Steps

### Step 1: Backup Data

Trước khi migrate, backup database hiện tại:

```bash
pg_dump -U postgres -d dien_tu_nam_tong > backup_$(date +%Y%m%d).sql
```

### Step 2: Install New Dependencies

```bash
cd backend
npm install
```

### Step 3: Setup Environment

Copy `.env.example` to `.env` và cấu hình:

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dien_tu_nam_tong
DB_SSL=false
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-key
STORAGE_BUCKET=content
MAX_FILE_SIZE=5242880
```

### Step 4: Migrate Existing Data

#### A. TypeORM sẽ tự động tạo schema mới

Khi chạy lần đầu, TypeORM sẽ sync schema dựa trên entities.

**⚠️ QUAN TRỌNG**: Nếu database đã có data, TypeORM sẽ cố gắng sync. Có 2 options:

**Option 1: Fresh Database (Recommended for development)**

```sql
-- Drop old database
DROP DATABASE IF EXISTS dien_tu_nam_tong;
CREATE DATABASE dien_tu_nam_tong;
```

Sau đó chạy:

```bash
npm run dev
```

TypeORM sẽ tự động tạo tables mới.

**Option 2: Preserve Existing Data**

Nếu muốn giữ data cũ, cần migrate manually:

1. **Migrate password field:**

```sql
-- Update password column type if needed
ALTER TABLE profile 
  ALTER COLUMN password TYPE VARCHAR(255);

-- Hash existing passwords (⚠️ passwords sẽ bị thay đổi)
-- Nên reset tất cả passwords hoặc yêu cầu users đổi password
UPDATE profile 
SET password = '$2b$10$...' -- Placeholder, cần hash actual passwords
WHERE password IS NOT NULL;
```

2. **Add role column:**

```sql
-- Add role enum type
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- Add role column
ALTER TABLE profile 
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'admin';
```

3. **Add missing columns:**

TypeORM sẽ tự động thêm các columns thiếu khi `synchronize: true`.

### Step 5: Create Admin User

```bash
npm run build
npx tsx src/seeds/create-admin.ts
```

Hoặc manual SQL:

```sql
INSERT INTO profile (
  id, username, password, role, is_active, 
  company_name, email, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$rBV2Hn/6HxQDj.Ht8BQAUuBXJl7Zb0EZKjF3qN.5H0V3L.GVVW1Ty', -- 'Admin@123' hashed
  'admin',
  true,
  'Điện Tử Nam Tông',
  'admin@dientunantong.com',
  NOW(),
  NOW()
);
```

### Step 6: Update Frontend API Calls

Frontend cần update để gửi JWT token:

**Trước:**
```typescript
// No authentication
fetch('/api/admin/product')
```

**Sau:**
```typescript
// With JWT token
const token = localStorage.getItem('auth_token');
fetch('/api/admin/product', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

Tuy nhiên, RTK Query đã được setup sẵn trong `frontend/src/store/api/baseQuery.ts`, nên chỉ cần đảm bảo token được lưu đúng.

### Step 7: Test API

```bash
# Start server
npm run dev

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'

# Test protected route
curl http://localhost:4000/api/admin/product \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗂️ File Structure Comparison

### Old Structure
```
backend/
├── src/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   ├── product.route.js
│   │   ├── category.routes.js
│   │   └── ...
│   └── services/
│       ├── response.js
│       └── supabase.js
```

### New Structure
```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── entities/        # TypeORM entities
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic
│   ├── controllers/     # HTTP handlers
│   ├── middlewares/     # Express middlewares
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities & validators
│   ├── seeds/           # Database seeds
│   └── index.ts         # Entry point
```

## 🔐 Security Improvements

| Feature | Old | New |
|---------|-----|-----|
| Password Storage | Plain text ❌ | Bcrypt hashed ✅ |
| Authentication | Cookie only ❌ | JWT + Middleware ✅ |
| Authorization | None ❌ | Role-based ✅ |
| Input Validation | None ❌ | express-validator ✅ |
| SQL Injection | Vulnerable ❌ | Protected (TypeORM) ✅ |
| Error Handling | Inconsistent ❌ | Global handler ✅ |

## 📊 API Endpoint Changes

Hầu hết endpoints giữ nguyên, chỉ thêm authentication:

| Endpoint | Old | New |
|----------|-----|-----|
| POST /api/auth/login | ✅ | ✅ (returns JWT) |
| GET /api/product | ✅ | ✅ (no change) |
| GET /api/admin/product | ❌ No auth | ✅ Requires JWT |
| POST /api/admin/product | ❌ No auth | ✅ Requires JWT + Admin role |
| PUT /api/admin/product/:id | ❌ No auth | ✅ Requires JWT + Admin role |
| DELETE /api/admin/product/:id | ❌ No auth | ✅ Requires JWT + Admin role |

**Breaking Changes:**
- All `/api/admin/*` endpoints now require JWT token
- Login response format changed (now includes `token` field)

## 🐛 Common Issues

### Issue 1: "Cannot find module '@config/database'"

**Solution:** Install tsconfig-paths

```bash
npm install --save-dev tsconfig-paths
```

### Issue 2: TypeORM entities not found

**Solution:** Check `entities` path in `database.ts`:

```typescript
// For development (tsx)
entities: ["src/entities/**/*.ts"]

// For production (compiled JS)
entities: ["dist/entities/**/*.js"]
```

### Issue 3: Old passwords not working

**Solution:** Old plain text passwords không work với bcrypt. Cần:

1. Reset all passwords, hoặc
2. Re-hash existing passwords, hoặc
3. Yêu cầu users forgot password flow

### Issue 4: Frontend auth not working

**Solution:** Check:

1. Token được lưu trong localStorage as `auth_token`
2. RTK Query baseQuery sends Authorization header
3. Backend JWT_SECRET matches

## ✅ Verification Checklist

- [ ] Database connected successfully
- [ ] Admin user created
- [ ] Can login and receive JWT token
- [ ] Protected routes require authentication
- [ ] Old data preserved (if migrating)
- [ ] Frontend can authenticate
- [ ] File upload works with Supabase
- [ ] All API endpoints tested

## 🚀 Production Deployment

### Before Deploy

1. **Set `synchronize: false` in production:**

```typescript
// src/config/database.ts
synchronize: process.env.NODE_ENV !== "production"
```

2. **Use migrations:**

```bash
npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
```

3. **Set strong JWT_SECRET:**

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. **Enable SSL for database:**

```env
DB_SSL=true
```

## 📚 Resources

- [TypeORM Documentation](https://typeorm.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Need help?** Check logs or contact dev team.

