# 🗄️ Database Explained - Cách TypeORM hoạt động

## 📝 TL;DR - Tóm tắt nhanh

### ❓ Khi chạy `npm run dev`, điều gì xảy ra?

**1. TypeORM tự động sync schema:**
```typescript
synchronize: true  // Chỉ trong development
```

**Nghĩa là:**
- ✅ TypeORM **TỰ ĐỘNG** đọc entities (Product, Category, etc.)
- ✅ TypeORM **TỰ ĐỘNG** so sánh với DB hiện tại
- ✅ TypeORM **TỰ ĐỘNG** tạo/update tables nếu khác
- ✅ **KHÔNG XÓA** data có sẵn
- ✅ **KHÔNG CẦN** tạo lại DB mỗi lần

### ❓ Có phải tạo lại DB mỗi lần không?

**KHÔNG!** TypeORM thông minh:
- Lần đầu: Tạo tất cả tables
- Lần sau: Chỉ update nếu có thay đổi schema
- Data vẫn giữ nguyên

### ❓ Khi nào cần reset DB?

Chỉ khi:
- ❌ Muốn xóa toàn bộ data
- ❌ Schema conflict nghiêm trọng
- ❌ Test từ đầu

---

## 🔍 Chi tiết TypeORM Auto-Sync

### Config hiện tại

```typescript
// backend/src/config/database.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // 🔑 KEY SETTING:
  synchronize: process.env.NODE_ENV === "development", // true in dev
  
  logging: process.env.NODE_ENV === "development", // log queries
  
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
```

### Quá trình Auto-Sync

```
┌─────────────────────────────────────┐
│  npm run dev                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Start Server (src/index.ts)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  initializeDatabase()               │
│  await AppDataSource.initialize()   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  TypeORM đọc tất cả entities:       │
│  - Product.ts                       │
│  - Category.ts                      │
│  - ProductImage.ts                  │
│  - Contact.ts                       │
│  - Profile.ts                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  TypeORM kiểm tra database:         │
│  - Table product có chưa?           │
│  - Columns đúng chưa?               │
│  - Foreign keys đúng chưa?          │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌─────────┐        ┌──────────┐
│ Có rồi  │        │ Chưa có  │
└────┬────┘        └─────┬────┘
     │                   │
     ▼                   ▼
┌─────────┐        ┌──────────┐
│ So sánh │        │ Tạo mới  │
│ schema  │        │ tables   │
└────┬────┘        └─────┬────┘
     │                   │
     ▼                   │
┌──────────┐             │
│ Cần      │             │
│ update?  │             │
└────┬─────┘             │
     │                   │
  ┌──┴───┐               │
  │ Yes  │               │
  └──┬───┘               │
     │                   │
     ▼                   ▼
┌─────────────────────────┐
│ ALTER TABLE ...         │
│ ADD COLUMN ...          │
│ CREATE INDEX ...        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ ✅ Database ready        │
│ 🚀 Server starts         │
└─────────────────────────┘
```

---

## 📋 Ví dụ cụ thể

### Scenario 1: Lần chạy đầu tiên

**Database:** Empty (không có table gì)

```bash
npm run dev
```

**TypeORM sẽ:**
```sql
-- TypeORM tự động chạy:
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  short_description TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_category (
  product_id UUID REFERENCES product(id),
  category_id UUID REFERENCES category(id),
  PRIMARY KEY (product_id, category_id)
);

-- ... và tất cả tables khác
```

**Console output:**
```
✅ Database connected successfully
🚀 Server Started Successfully!
```

---

### Scenario 2: Chạy lần thứ 2 (không thay đổi gì)

**Database:** Đã có tables + data

```bash
npm run dev
```

**TypeORM sẽ:**
```
1. Check tables: ✅ Đã có
2. Compare schema: ✅ Giống nhau
3. Skip sync
4. Start server
```

**Console output:**
```
✅ Database connected successfully
🚀 Server Started Successfully!
```

**Data:** ✅ Giữ nguyên 100%

---

### Scenario 3: Bạn thêm column mới vào entity

**Ví dụ:** Thêm `stock` vào Product

```typescript
// src/entities/Product.ts
@Entity("product")
export class Product {
  // ... existing fields
  
  @Column({ type: "integer", default: 0 })  // ← NEW FIELD
  stock!: number;
}
```

**Chạy:**
```bash
npm run dev
```

**TypeORM sẽ:**
```sql
-- TypeORM tự động chạy:
ALTER TABLE product 
ADD COLUMN stock INTEGER DEFAULT 0;
```

**Console output:**
```
query: ALTER TABLE "product" ADD "stock" integer DEFAULT 0
✅ Database connected successfully
🚀 Server Started Successfully!
```

**Data cũ:** ✅ Giữ nguyên (stock = 0 cho rows cũ)

---

## ❓ Câu hỏi thường gặp

### Q1: Có mất data không khi chạy lại server?

**A: KHÔNG!** TypeORM chỉ update schema, không xóa data.

### Q2: Khi nào cần xóa DB?

**A:** Chỉ khi:
- Muốn reset toàn bộ (test clean)
- Schema conflict không fix được
- Muốn bắt đầu lại từ đầu

### Q3: Làm thế nào để reset DB?

**Option 1: Drop database (xóa toàn bộ)**
```bash
# Connect to postgres
psql -U postgres

# Drop database
DROP DATABASE dien_tu_nam_tong;

# Recreate
CREATE DATABASE dien_tu_nam_tong;

# Exit
\q

# Chạy server (TypeORM sẽ tạo lại tables)
npm run dev
```

**Option 2: Drop schema (TypeORM command)**
```bash
npm run schema:drop  # ⚠️ XÓA TẤT CẢ TABLES!
npm run dev          # Tạo lại
```

**Option 3: Drop individual table**
```sql
DROP TABLE product CASCADE;
DROP TABLE category CASCADE;
-- ... etc
```

### Q4: Tôi thay đổi entity, có cần làm gì không?

**A: KHÔNG!** Chỉ cần restart server:
```bash
# Ctrl+C để stop
npm run dev  # Start lại
```

TypeORM tự động sync changes.

### Q5: Tại sao không dùng migrations trong dev?

**A:** Vì:
- ✅ Auto-sync nhanh hơn, tiện hơn trong dev
- ✅ Không cần viết migration cho mỗi thay đổi nhỏ
- ✅ Thử nghiệm dễ dàng

**Production thì PHẢI dùng migrations!**

---

## 🔄 Development vs Production

### Development Mode (auto-sync)

```typescript
NODE_ENV=development
synchronize: true  // ✅ Auto-sync enabled
```

**Ưu điểm:**
- ⚡ Nhanh - không cần viết migration
- 🔄 Tự động - thay đổi entity → restart → done
- 🧪 Linh hoạt - test schema dễ dàng

**Nhược điểm:**
- ⚠️ Không kiểm soát được changes
- ⚠️ Có thể mất data nếu change type
- ⚠️ Không có version control cho DB

---

### Production Mode (migrations)

```typescript
NODE_ENV=production
synchronize: false  // ❌ Auto-sync disabled
```

**Phải dùng migrations:**
```bash
# Generate migration
npm run migration:generate -- src/migrations/AddStockToProduct

# Run migration
npm run migration:run

# Rollback if needed
npm run migration:revert
```

**Ưu điểm:**
- ✅ Kiểm soát tuyệt đối
- ✅ Version control
- ✅ Rollback được
- ✅ Review được changes
- ✅ An toàn

**Nhược điểm:**
- 📝 Phải viết migration code
- ⏱️ Chậm hơn trong dev

---

## 🎯 Best Practices

### Development

```bash
# 1. Thay đổi entity
# Edit src/entities/Product.ts

# 2. Restart server
npm run dev

# 3. TypeORM auto-sync
# Done!
```

### Testing Schema Changes

```bash
# 1. Backup data (nếu quan trọng)
pg_dump -U postgres dien_tu_nam_tong > backup.sql

# 2. Thử nghiệm
# Edit entities
npm run dev

# 3. Nếu có vấn đề, restore
psql -U postgres dien_tu_nam_tong < backup.sql
```

### Production

```bash
# 1. Thay đổi entity + write migration
npm run migration:generate -- src/migrations/MyChange

# 2. Review migration file
cat src/migrations/*_MyChange.ts

# 3. Test trên staging
npm run migration:run

# 4. Deploy to production
npm run migration:run  # On production server
```

---

## 🧪 Testing Guide

### Fresh Start (Empty DB)

```bash
# 1. Drop DB
psql -U postgres
DROP DATABASE dien_tu_nam_tong;
CREATE DATABASE dien_tu_nam_tong;
\q

# 2. Start server (auto-creates tables)
npm run dev

# 3. Create admin user
npx tsx src/seeds/create-admin.ts

# 4. Done!
```

### Keep Data, Update Schema

```bash
# Just restart server
npm run dev

# TypeORM will:
# - Keep existing data
# - Update schema only
```

---

## ⚠️ Gotchas & Warnings

### Nguy hiểm với auto-sync:

**1. Đổi type của column:**
```typescript
// Before
@Column({ type: "varchar" })
name!: string;

// After
@Column({ type: "integer" })  // ⚠️ DANGER!
name!: number;
```

**TypeORM có thể:**
- ❌ Fail migration
- ❌ Mất data (không convert được)
- ❌ Corrupt table

**Giải pháp:** Drop column cũ, tạo column mới

---

**2. Rename column:**
```typescript
// Before
@Column()
old_name!: string;

// After
@Column()
new_name!: string;  // ⚠️ TypeORM nghĩ là 2 columns khác nhau
```

**TypeORM sẽ:**
- ❌ Tạo column `new_name`
- ❌ Giữ column `old_name` (mất data)

**Giải pháp:** Manual rename trong DB hoặc migration

---

**3. Delete column:**
```typescript
// Just remove from entity
// TypeORM will DROP COLUMN
// ⚠️ Data in that column will be LOST!
```

**An toàn hơn:** Comment out thay vì xóa, test trước

---

## 📚 Quick Reference

### TypeORM Auto-Sync Commands

```typescript
// NO manual commands needed!
// Just: npm run dev

// If you want manual control:
npm run schema:sync   // Force sync schema
npm run schema:drop   // Drop all tables (⚠️)
```

### Useful psql Commands

```bash
# Connect
psql -U postgres -d dien_tu_nam_tong

# List tables
\dt

# Describe table
\d product

# View data
SELECT * FROM product;

# Count rows
SELECT COUNT(*) FROM product;

# Exit
\q
```

---

## 🎓 Summary

### Khi chạy `npm run dev`:

1. ✅ TypeORM kết nối database
2. ✅ TypeORM đọc entities
3. ✅ TypeORM sync schema (auto)
4. ✅ Server start
5. ✅ Data giữ nguyên

### Bạn KHÔNG cần:

- ❌ Tạo tables manually
- ❌ Viết SQL scripts
- ❌ Run migrations (dev mode)
- ❌ Reset DB mỗi lần
- ❌ Worry về schema

### Bạn CHỈ cần:

- ✅ Define entities
- ✅ Run `npm run dev`
- ✅ TypeORM lo phần còn lại!

---

**Magic of TypeORM Auto-Sync! ✨**

**Câu hỏi?** Check logs khi start server để xem TypeORM đang làm gì.

