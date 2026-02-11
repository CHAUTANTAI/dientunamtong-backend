# 🚀 Setup Guide - Backend TypeScript với TypeORM

## 📋 Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

## 📝 Bước 2: Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dien_tu_nam_tong
DB_SSL=false

# JWT Configuration  
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Storage Configuration
STORAGE_BUCKET=content
MAX_FILE_SIZE=5242880
```

## 🗄️ Bước 3: Setup Database

### Option A: Automatic Sync (Development)

TypeORM sẽ tự động sync schema khi chạy ở development mode:

```bash
npm run dev
```

TypeORM sẽ tự động tạo các tables dựa trên entities.

### Option B: Manual Migration (Production)

```bash
# Build TypeScript
npm run build

# Generate migration
npm run migration:generate -- src/migrations/InitialSchema

# Run migration
npm run migration:run
```

## 👤 Bước 4: Tạo Admin User

Sau khi database đã được setup, bạn cần tạo admin user đầu tiên.

### Cách 1: Sử dụng SQL trực tiếp

```sql
INSERT INTO profile (
  id,
  username,
  password,
  role,
  is_active,
  company_name,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$YourHashedPasswordHere', -- Password sẽ được hash tự động khi login lần đầu
  'admin',
  true,
  'Điện Tử Nam Tông',
  NOW(),
  NOW()
);
```

### Cách 2: Create seed script

Tạo file `backend/src/seeds/create-admin.ts`:

```typescript
import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "@config/database";
import { Profile, UserRole } from "@entities/Profile";

async function createAdmin() {
  await AppDataSource.initialize();

  const profileRepo = AppDataSource.getRepository(Profile);

  // Check if admin exists
  const existingAdmin = await profileRepo.findOne({
    where: { username: "admin" },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
    process.exit(0);
  }

  // Create admin
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  
  const admin = profileRepo.create({
    username: "admin",
    password: hashedPassword,
    role: UserRole.ADMIN,
    is_active: true,
    company_name: "Điện Tử Nam Tông",
    email: "admin@dientunantong.com",
  });

  await profileRepo.save(admin);

  console.log("✅ Admin user created successfully");
  console.log("Username: admin");
  console.log("Password: Admin@123");
  console.log("⚠️  Please change password after first login!");

  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("❌ Error creating admin:", error);
  process.exit(1);
});
```

Chạy seed:

```bash
npx tsx src/seeds/create-admin.ts
```

## 🎯 Bước 5: Chạy Server

### Development Mode (with hot reload)

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:4000`

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

## ✅ Bước 6: Test API

### Health Check

```bash
curl http://localhost:4000/health
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

Response sẽ trả về token JWT. Copy token và sử dụng cho các requests tiếp theo.

### Test Protected Route

```bash
curl http://localhost:4000/api/admin/product \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Troubleshooting

### Lỗi: Cannot find module '@config/database'

Cài đặt `tsconfig-paths`:

```bash
npm install --save-dev tsconfig-paths
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "tsx -r tsconfig-paths/register watch src/index.ts"
  }
}
```

### Lỗi: Database connection failed

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra credentials trong `.env`
- Kiểm tra database `dien_tu_nam_tong` đã được tạo

```sql
CREATE DATABASE dien_tu_nam_tong;
```

### Lỗi: TypeORM entities not found

Đảm bảo `entities` path trong `database.ts` đúng:

```typescript
entities: ["src/entities/**/*.ts"],  // Development
entities: ["dist/entities/**/*.js"], // Production
```

## 📚 Next Steps

1. ✅ Setup database
2. ✅ Create admin user
3. ✅ Test login
4. 📝 Configure Supabase Storage
5. 🎨 Connect frontend

## 🎓 Learn More

- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Cần giúp đỡ?** Kiểm tra `README.md` hoặc logs để debug.

