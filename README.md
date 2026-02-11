# Backend API - Điện Tử Nam Tông

Backend API v2.0 xây dựng với **TypeScript**, **Express.js**, **TypeORM**, và **PostgreSQL**.

## 📚 Documentation

**[→ VIEW COMPLETE DOCUMENTATION INDEX](./INDEX.md)** ← Start Here!

### Quick Links
- 🚀 **[Quick Start (5 minutes)](./QUICKSTART.md)** - Get running fast
- 📚 **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- 🏗️ **[Architecture Guide](./ARCHITECTURE.md)** - System design
- 🚀 **[Deployment Guide](./DEPLOYMENT.md)** - Production setup
- 🔄 **[Migration Guide](./MIGRATION_GUIDE.md)** - Upgrade from v1.0

---

## 🏗️ Kiến Trúc

Dự án được tổ chức theo **Clean Architecture** với các layers sau:

```
src/
├── config/           # Cấu hình (database, env, supabase)
├── entities/         # TypeORM entities (domain models)
├── repositories/     # Data access layer
├── services/         # Business logic layer
├── controllers/      # HTTP request handlers
├── middlewares/      # Express middlewares (auth, error, validation)
├── routes/           # API routes
├── types/            # TypeScript types & DTOs
├── utils/            # Utility functions & validators
└── index.ts          # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Supabase account (for file storage)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migrations:**

TypeORM will auto-sync schema in development mode. For production, use migrations:

```bash
# Generate migration from entities
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:4000`

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication

Most admin endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

#### Products (Public)
- `GET /api/product` - Get all active products
- `GET /api/product/:id` - Get product detail

#### Products (Admin)
- `GET /api/admin/product` - Get all products
- `GET /api/admin/product/:id` - Get product detail
- `POST /api/admin/product` - Create product
- `PUT /api/admin/product/:id` - Update product
- `DELETE /api/admin/product/:id` - Delete product (soft)
- `PUT /api/admin/product/:id/category` - Update product categories

#### Product Images (Admin)
- `GET /api/admin/product/:id/images` - Get product images
- `POST /api/admin/product-image` - Add product image
- `POST /api/admin/product/:id/image` - Upload image (legacy)
- `DELETE /api/admin/product-image/:imageId` - Delete image
- `PUT /api/admin/product-image/:imageId/sort` - Update sort order

#### Categories (Public)
- `GET /api/category` - Get all active categories

#### Categories (Admin)
- `GET /api/admin/category` - Get all categories
- `GET /api/admin/category/:id` - Get category detail
- `POST /api/admin/category` - Create category
- `PUT /api/admin/category/:id` - Update category
- `DELETE /api/admin/category/:id` - Delete category (soft)

#### Contacts (Public)
- `POST /api/contact` - Create contact

#### Contacts (Admin)
- `GET /api/admin/contact` - Get all contacts
- `GET /api/admin/contact/:id` - Get contact detail
- `PUT /api/admin/contact/:id` - Update contact status
- `DELETE /api/admin/contact/:id` - Delete contact

#### Profile (Public)
- `GET /api/profile` - Get public company info

#### Profile (Admin)
- `GET /api/admin/profile` - Get full profile
- `PUT /api/admin/profile` - Update profile
- `PUT /api/admin/profile/password` - Change password

## 🗄️ Database Schema

### Entities

- **Product** - Sản phẩm
- **ProductImage** - Ảnh sản phẩm
- **Category** - Danh mục
- **Contact** - Liên hệ từ khách hàng
- **Profile** - Thông tin công ty & admin user

Relations:
- Product 1-N ProductImage
- Product N-N Category (through product_category junction table)

## 🔐 Security Features

✅ **Password Hashing** - bcrypt  
✅ **JWT Authentication** - jsonwebtoken  
✅ **Role-based Access Control** - Admin, Manager, Staff roles  
✅ **Input Validation** - express-validator  
✅ **SQL Injection Protection** - TypeORM parameterized queries  
✅ **Error Handling** - Global error handler  

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Storage:** Supabase Storage
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Password Hashing:** bcrypt
- **File Upload:** multer

## 📝 Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm run typeorm          # Run TypeORM CLI commands
npm run migration:generate  # Generate migration from entities
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration
npm run schema:sync      # Sync schema with database (dev only)
npm run schema:drop      # Drop all database tables (⚠️ dangerous)
```

## 🔄 Code-First Database Management

This project uses **TypeORM Code-First Approach**:

1. Define entities in `src/entities/` with decorators
2. TypeORM generates database schema from entities
3. In development: auto-sync enabled
4. In production: use migrations

### Example: Adding New Entity

```typescript
// src/entities/NewEntity.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("new_entity")
export class NewEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;
}
```

Then run:
```bash
npm run migration:generate -- src/migrations/AddNewEntity
npm run migration:run
```

## 🚨 Error Handling

All errors are handled by global error middleware. Custom error classes:

- `AppError` - Base error class
- `NotFoundError` - 404 errors
- `ValidationError` - 400 validation errors
- `UnauthorizedError` - 401 auth errors
- `ForbiddenError` - 403 permission errors

## 📦 Environment Variables

See `.env.example` for all required environment variables.

**Important:**
- Change `JWT_SECRET` in production
- Use strong database password
- Enable SSL for production database

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow existing code structure
3. Add validation for new endpoints
4. Test before committing

## 📄 License

ISC

---

**Version:** 2.0.0  
**Last Updated:** February 2026

