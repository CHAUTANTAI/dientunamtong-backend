# 🚀 Database Quick Guide - 3 phút hiểu TypeORM

## ❓ Câu hỏi của bạn

### "Khi chạy `npm run dev`, điều gì sẽ xảy ra?"

**Trả lời ngắn gọn:**

```
npm run dev
    ↓
TypeORM đọc entities (Product.ts, Category.ts, etc.)
    ↓
TypeORM so sánh với database hiện tại
    ↓
Nếu chưa có table → Tạo mới
Nếu đã có nhưng khác → Update
Nếu đã có và giống → Skip
    ↓
Server start
    ↓
✅ DONE! Data vẫn giữ nguyên
```

---

## ✅ Những gì TypeORM TỰ ĐỘNG làm

```typescript
// File: src/config/database.ts
synchronize: true  // ← Magic happens here!
```

**TypeORM sẽ:**
1. ✅ Tự động TẠO tables nếu chưa có
2. ✅ Tự động THÊM columns nếu thiếu
3. ✅ Tự động TẠO foreign keys
4. ✅ Tự động TẠO indexes
5. ✅ **KHÔNG XÓA** data có sẵn

---

## ❌ Những gì TypeORM KHÔNG làm

1. ❌ **KHÔNG** xóa data
2. ❌ **KHÔNG** tạo lại DB mỗi lần
3. ❌ **KHÔNG** cần bạn viết SQL
4. ❌ **KHÔNG** cần bạn tạo tables manually

---

## 🎯 Workflow thực tế

### Lần đầu tiên (DB empty)

```bash
# 1. Tạo database
psql -U postgres
CREATE DATABASE dien_tu_nam_tong;
\q

# 2. Start server
npm run dev

# TypeORM tự động:
# - Tạo table product
# - Tạo table category
# - Tạo table product_image
# - Tạo table contact
# - Tạo table profile
# - Tạo table product_category (junction)

# 3. Create admin
npx tsx src/seeds/create-admin.ts

# ✅ DONE!
```

**Console output:**
```
✅ Database connected successfully
🚀 Server Started Successfully!
```

---

### Lần thứ 2, 3, 4... (DB đã có data)

```bash
npm run dev

# TypeORM check:
# - Tables có rồi? ✅
# - Schema giống nhau? ✅
# - Skip sync
# - Start server

# ✅ Data vẫn còn nguyên!
```

---

### Khi thêm field mới vào entity

```typescript
// src/entities/Product.ts
@Entity("product")
export class Product {
  // ... existing fields
  
  @Column({ type: "integer", default: 0 })  // ← NEW!
  stock!: number;
}
```

```bash
# Restart server
npm run dev

# TypeORM tự động:
# ALTER TABLE product ADD COLUMN stock INTEGER DEFAULT 0;

# ✅ Data cũ vẫn còn, stock = 0 cho rows cũ
```

---

## 🔄 Có cần reset DB không?

### KHÔNG CẦN trong các trường hợp:

- ✅ Chạy lại server
- ✅ Thêm field mới
- ✅ Thêm entity mới
- ✅ Thay đổi default value
- ✅ Thêm index

### CẦN RESET khi:

- ❌ Muốn xóa toàn bộ data (test clean)
- ❌ Schema conflict nghiêm trọng
- ❌ Đổi type column (varchar → integer)
- ❌ Rename column (TypeORM không detect)

---

## 🧹 Cách reset DB (nếu cần)

### Option 1: Drop & Recreate Database

```bash
psql -U postgres

DROP DATABASE dien_tu_nam_tong;
CREATE DATABASE dien_tu_nam_tong;

\q

npm run dev  # TypeORM tạo lại tables
npx tsx src/seeds/create-admin.ts  # Tạo lại admin
```

### Option 2: TypeORM Schema Drop

```bash
npm run schema:drop  # ⚠️ XÓA TẤT CẢ TABLES!
npm run dev          # Tạo lại
npx tsx src/seeds/create-admin.ts
```

### Option 3: Drop specific table

```sql
-- Connect to DB
psql -U postgres -d dien_tu_nam_tong

-- Drop table
DROP TABLE product CASCADE;

-- Exit
\q

-- Restart (TypeORM recreates)
npm run dev
```

---

## 📊 Kiểm tra DB

```bash
# Connect
psql -U postgres -d dien_tu_nam_tong

# List tables
\dt

# View table structure
\d product

# View data
SELECT * FROM product;
SELECT * FROM profile;

# Count rows
SELECT COUNT(*) FROM product;

# Exit
\q
```

---

## 🎓 Key Takeaways

### 1. TypeORM = Magic

```
Define entities → npm run dev → Tables created!
```

Không cần viết SQL, không cần migrations (dev mode).

### 2. Data Safety

```
TypeORM chỉ update SCHEMA, không xóa DATA
```

Trừ khi bạn chủ động drop table/database.

### 3. Development Workflow

```
1. Edit entity
2. Restart server
3. Done!
```

TypeORM tự động sync changes.

### 4. Production Workflow

```
1. Edit entity
2. Generate migration
3. Review migration
4. Run migration
```

Không dùng auto-sync trong production!

---

## 🆘 Troubleshooting

### "Database connection failed"

```bash
# Check PostgreSQL running
pg_isready

# Check credentials in .env
cat .env | grep DB_

# Test connection
psql -U postgres -d dien_tu_nam_tong
```

### "Table already exists"

```
Không sao! TypeORM sẽ skip nếu table đã có.
```

### "Column type mismatch"

```bash
# Drop table và tạo lại
psql -U postgres -d dien_tu_nam_tong
DROP TABLE product CASCADE;
\q

npm run dev  # TypeORM recreates
```

### "Lost data after restart"

```
Không thể! TypeORM không xóa data.
Có thể bạn đã drop database hoặc table.
```

---

## 📚 Đọc thêm

- **Chi tiết:** [DATABASE_EXPLAINED.md](./DATABASE_EXPLAINED.md)
- **Setup:** [SETUP.md](./SETUP.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🎯 Tóm tắt 1 dòng

**TypeORM auto-sync = Bạn chỉ cần code entities, TypeORM lo DB! ✨**

---

**Câu hỏi khác?** Đọc [DATABASE_EXPLAINED.md](./DATABASE_EXPLAINED.md) để hiểu sâu hơn.

