# 🏪 Backend API - Điện Tử Nam Tông

**E-Commerce Backend API v2.1** - TypeScript + Express + TypeORM + PostgreSQL

> Backend API cho hệ thống catalog điện tử với **category tree**, **media management**, **advanced filtering & search**.

---

## 📚 Quick Links

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 🚀 Setup & Run trong 5 phút |
| **[DATABASE.md](./DATABASE.md)** | 🗄️ Database schema & migration |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | 📖 Complete API reference |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ System architecture |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 🌐 Production deployment |

---

## ✨ Key Features

### 🗂️ **Advanced Category System**
- ✅ **Nested categories** - Unlimited levels với Tree Closure Table
- ✅ **Fast tree operations** - Get descendants/ancestors trong 1 query
- ✅ **Breadcrumb support** - Auto-generate navigation paths
- ✅ **Drag & drop** - Move categories với automatic level calculation

### 🎯 **Product Management**
- ✅ **Rich filtering** - Category, price range, tags, stock status
- ✅ **Full-text search** - Name, description, SKU với indexes
- ✅ **Include descendants** - Tìm products trong category + subcategories
- ✅ **Related products** - Auto-suggest based on categories
- ✅ **Featured products** - Sorting by view count
- ✅ **Tag system** - Flexible product tagging

### 📸 **Media Management**
- ✅ **Multi-media support** - Image, Video, Audio, Document
- ✅ **Supabase Storage** - CDN-backed file storage
- ✅ **Sort ordering** - Drag & drop media ordering
- ✅ **Bulk upload** - Upload multiple files at once
- ✅ **Orphan cleanup** - Auto-detect unused media

### 🔐 **Authentication & Authorization**
- ✅ **JWT-based auth** - Secure token authentication
- ✅ **Role-based access** - Admin, Manager, Staff roles
- ✅ **Protected routes** - Middleware-based authorization

### 📊 **Performance Optimizations**
- ✅ **Database indexes** - Optimized for search/filter queries
- ✅ **Eager/Lazy loading** - Smart relation loading
- ✅ **Query builder** - Complex filters without N+1
- ✅ **Pagination** - Efficient data loading

---

## 🛠️ Tech Stack

```typescript
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.3",
  "framework": "Express.js 4.19",
  "orm": "TypeORM 0.3.20",
  "database": "PostgreSQL 14+",
  "storage": "Supabase Storage",
  "auth": "JWT + bcrypt",
  "validation": "express-validator"
}
```

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Database, ENV, Supabase config
│   ├── entities/         # TypeORM entities (domain models)
│   │   ├── Category.ts     → Tree structure với @Tree("closure-table")
│   │   ├── Product.ts      → With media, tags, specifications
│   │   ├── Media.ts        → Multi-media support
│   │   ├── Profile.ts      → User accounts
│   │   └── Contact.ts      → Contact submissions
│   ├── repositories/     # Data access layer
│   │   ├── CategoryRepository.ts  → Tree operations
│   │   ├── ProductRepository.ts   → Advanced filters
│   │   └── MediaRepository.ts     → Media management
│   ├── services/         # Business logic
│   ├── controllers/      # HTTP handlers
│   ├── routes/           # API routes
│   │   ├── Public routes    → /api/category, /api/product
│   │   └── Admin routes     → /api/admin/*
│   ├── middlewares/      # Auth, validation, error handling
│   ├── types/            # DTOs & TypeScript types
│   └── utils/            # Validators & helpers
│
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

**Design Pattern:** Clean Architecture với clear separation of concerns

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
Node.js >= 18
PostgreSQL >= 14
npm or yarn
Supabase account (for file storage)
```

### 2. Installation
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (TypeORM auto-sync in dev)
npm run dev
```

### 3. Create Admin User
```bash
npm run seed:admin

# Default credentials:
# Username: admin
# Password: Admin@123
```

### 4. Start Development Server
```bash
npm run dev

# Server running at http://localhost:4000
```

**→ Full setup guide: [QUICKSTART.md](./QUICKSTART.md)**

---

## 📖 API Endpoints

### Public Endpoints

#### Categories
```http
GET    /api/category              # List categories
GET    /api/category/tree         # Full tree structure
GET    /api/category/roots        # Root categories only
GET    /api/category/:id          # Get by ID
GET    /api/category/slug/:slug   # Get by slug
GET    /api/category/:id/children # Get children
GET    /api/category/:id/breadcrumb # Get breadcrumb path
GET    /api/category/search?q=... # Search categories
```

#### Products
```http
GET    /api/product                      # List with filters
GET    /api/product/:id                  # Get by ID
GET    /api/product/slug/:slug           # Get by slug
GET    /api/product/:id/related          # Related products
GET    /api/product/featured             # Featured products
GET    /api/product/category/:slug       # By category
GET    /api/product/tag/:tag             # By tag
GET    /api/product/tags                 # All tags
```

**Filtering & Search:**
```http
GET /api/product?
  category_id=uuid                 # Filter by category
  &include_descendants=true        # Include subcategories
  &searchKey=laptop                # Search in name/desc/sku
  &min_price=1000                  # Price range
  &max_price=50000
  &tags=gaming,rgb                 # Filter by tags
  &in_stock=true                   # Only in-stock
  &sort_by=price                   # Sort by: price, name, created_at
  &sort_order=ASC                  # ASC or DESC
  &limit=20                        # Pagination
  &offset=0
```

### Admin Endpoints (Require Authentication)

```http
# Authentication
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout

# Category Management
POST   /api/admin/category       # Create category
PUT    /api/admin/category/:id   # Update category
DELETE /api/admin/category/:id   # Soft delete
PATCH  /api/admin/category/:id/move  # Move to different parent

# Product Management
POST   /api/admin/product        # Create product
PUT    /api/admin/product/:id    # Update product
DELETE /api/admin/product/:id    # Soft delete
PUT    /api/admin/product/:id/category  # Update categories

# Media Management
POST   /api/admin/media          # Create media record
POST   /api/admin/media/bulk     # Bulk create
PATCH  /api/admin/media/:id/sort-order  # Update sort order
DELETE /api/admin/media/:id      # Delete media
GET    /api/admin/media/orphan   # Get orphan media
DELETE /api/admin/media/orphan/cleanup  # Cleanup orphans
```

**→ Complete API docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

---

## 🗄️ Database Schema

### Core Tables
```
profile          → User accounts (admin, manager, staff)
category         → Nested categories with tree structure
category_closure → Tree closure table (auto-managed by TypeORM)
product          → Products with media, tags, specifications
product_category → Many-to-many junction table
media            → Multi-media storage (image, video, audio, document)
contact          → Contact form submissions
```

### Key Features
- ✅ **UUID Primary Keys** - Better for distributed systems
- ✅ **Timestamps** - Auto created_at/updated_at
- ✅ **Soft Deletes** - is_active flags
- ✅ **Indexes** - Optimized for search/filter queries
- ✅ **Foreign Keys** - Referential integrity with CASCADE/SET NULL
- ✅ **JSONB** - Flexible specifications field
- ✅ **Array** - Native PostgreSQL array for tags
- ✅ **Enums** - Type-safe status/role fields

**→ Full schema: [DATABASE.md](./DATABASE.md)**

---

## 📦 npm Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run seed:admin   # Create admin user
npm run typeorm      # TypeORM CLI

# Linting
npm run lint         # Check code quality
npm run lint:fix     # Auto-fix issues
```

---

## 🌳 Environment Variables

```env
# Server
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dien_tu_nam_tong
DB_SSL=false

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_supabase_key
```

---

## 🔒 Security

- ✅ **JWT Authentication** - Token-based auth
- ✅ **bcrypt** - Password hashing (10 rounds)
- ✅ **Role-based access** - Admin/Manager/Staff
- ✅ **Input validation** - express-validator
- ✅ **SQL injection protection** - TypeORM parameterized queries
- ✅ **CORS** - Configurable origins
- ✅ **Rate limiting** - (Add if needed)

---

## 🎯 Development Workflow

### 1. Create Feature
```bash
# Create entity → Repository → Service → Controller → Routes
src/entities/NewEntity.ts
src/repositories/NewEntityRepository.ts
src/services/NewEntityService.ts
src/controllers/NewEntityController.ts
src/routes/newEntity.routes.ts
```

### 2. Register Routes
```typescript
// src/routes/index.ts
import newEntityRoutes from "./newEntity.routes";
router.use("/api/new-entity", newEntityRoutes);
```

### 3. Test API
```bash
# Use Thunder Client, Postman, or curl
curl http://localhost:4000/api/new-entity
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d dien_tu_nam_tong
```

### Port Already in Use
```bash
# Kill process on port 4000
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### TypeORM Sync Issues
```bash
# Drop and recreate database
dropdb dien_tu_nam_tong
createdb dien_tu_nam_tong
npm run dev
```

---

## 📝 License

Private Project - Điện Tử Nam Tông

---

## 👥 Team

Backend Development Team - 2026

---

## 📞 Support

For questions or issues, contact the development team.
