# 🏗️ Backend Architecture Documentation

## 📋 Overview

Backend được xây dựng theo **Clean Architecture** pattern với TypeScript, Express.js, và TypeORM.

## 🎯 Architecture Principles

### 1. Separation of Concerns
Mỗi layer có trách nhiệm riêng biệt:
- **Entities**: Domain models (database schema)
- **Repositories**: Data access logic
- **Services**: Business logic
- **Controllers**: HTTP request handling
- **Routes**: API endpoint definitions
- **Middlewares**: Cross-cutting concerns (auth, validation, errors)

### 2. Dependency Rule
Dependencies chỉ flow từ ngoài vào trong:
```
Routes → Controllers → Services → Repositories → Entities
```

### 3. Code-First Database
Database schema được generate từ TypeORM entities, không phải ngược lại.

## 📂 Folder Structure

```
backend/
├── src/
│   ├── config/               # Configuration layer
│   │   ├── database.ts       # TypeORM DataSource
│   │   ├── supabase.ts       # Supabase client
│   │   └── env.ts            # Environment variables
│   │
│   ├── entities/             # Domain layer (TypeORM entities)
│   │   ├── Product.ts        # Product entity
│   │   ├── ProductImage.ts   # ProductImage entity
│   │   ├── Category.ts       # Category entity
│   │   ├── Contact.ts        # Contact entity
│   │   ├── Profile.ts        # Profile entity (User)
│   │   └── index.ts          # Barrel export
│   │
│   ├── repositories/         # Data access layer
│   │   ├── BaseRepository.ts       # Base CRUD operations
│   │   ├── ProductRepository.ts    # Product-specific queries
│   │   ├── ProductImageRepository.ts
│   │   ├── CategoryRepository.ts
│   │   ├── ContactRepository.ts
│   │   ├── ProfileRepository.ts
│   │   └── index.ts
│   │
│   ├── services/             # Business logic layer
│   │   ├── AuthService.ts          # Authentication logic
│   │   ├── ProductService.ts       # Product business rules
│   │   ├── ProductImageService.ts
│   │   ├── CategoryService.ts
│   │   ├── ContactService.ts
│   │   ├── ProfileService.ts
│   │   └── index.ts
│   │
│   ├── controllers/          # Presentation layer
│   │   ├── AuthController.ts       # Auth HTTP handlers
│   │   ├── ProductController.ts    # Product HTTP handlers
│   │   ├── ProductImageController.ts
│   │   ├── CategoryController.ts
│   │   ├── ContactController.ts
│   │   ├── ProfileController.ts
│   │   └── index.ts
│   │
│   ├── routes/               # API routes layer
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── productImage.routes.ts
│   │   ├── category.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── profile.routes.ts
│   │   └── index.ts          # Route aggregator
│   │
│   ├── middlewares/          # Cross-cutting concerns
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── validation.middleware.ts # Input validation
│   │   ├── upload.middleware.ts    # File upload
│   │   └── index.ts
│   │
│   ├── types/                # Type definitions
│   │   ├── dtos.ts           # Data Transfer Objects
│   │   ├── responses.ts      # API responses & errors
│   │   └── express.d.ts      # Express type extensions
│   │
│   ├── utils/                # Utilities
│   │   └── validators.ts     # express-validator schemas
│   │
│   ├── seeds/                # Database seeds
│   │   └── create-admin.ts   # Create admin user
│   │
│   └── index.ts              # Application entry point
│
├── dist/                     # Compiled JavaScript (generated)
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── .gitignore
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
├── README.md                 # General documentation
├── SETUP.md                  # Setup guide
├── MIGRATION_GUIDE.md        # Migration from old backend
└── ARCHITECTURE.md           # This file
```

## 🔄 Data Flow

### Example: Create Product

```
1. Client Request
   POST /api/admin/product
   Headers: { Authorization: Bearer <token> }
   Body: { name, price, description, ... }
        ↓
2. Route Layer (product.routes.ts)
   - Match route
   - Apply middlewares: authenticate, authorize, validate
        ↓
3. Middleware Layer
   - authenticate: Verify JWT → attach user to req.user
   - authorize: Check user role (Admin)
   - validate: Check input (createProductValidator)
        ↓
4. Controller Layer (ProductController.ts)
   - Extract data from req.body
   - Call ProductService.createProduct()
        ↓
5. Service Layer (ProductService.ts)
   - Apply business logic
   - Call ProductRepository.create()
        ↓
6. Repository Layer (ProductRepository.ts)
   - Use TypeORM to insert into database
        ↓
7. Entity Layer (Product.ts)
   - TypeORM entity defines schema
        ↓
8. Database (PostgreSQL)
   - Execute INSERT query
        ↓
9. Response Flow (reverse)
   Database → Repository → Service → Controller → Client
   Response: { success: true, data: Product, statusCode: 201 }
```

## 🔐 Authentication Flow

### Login
```
1. POST /api/auth/login { username, password }
        ↓
2. AuthController.login()
        ↓
3. AuthService.login()
   - Find user by username
   - Compare password (bcrypt)
   - Generate JWT token
        ↓
4. Return { success, token, user }
```

### Protected Route Access
```
1. Request with Authorization header
        ↓
2. authenticate middleware
   - Extract JWT from header
   - Verify token signature
   - Load user from database
   - Attach to req.user
        ↓
3. authorize middleware (if needed)
   - Check user.role
   - Allow/deny based on required roles
        ↓
4. Controller executes
```

## 🗄️ Database Architecture

### Code-First Approach

1. **Define Entity** (TypeORM decorators)

```typescript
@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;
}
```

2. **TypeORM Generates Schema**

```sql
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2)
);
```

### Relations

```typescript
// Product → ProductImage (1-to-Many)
@OneToMany(() => ProductImage, (image) => image.product)
images?: ProductImage[];

// Product ← ProductImage (Many-to-1)
@ManyToOne(() => Product, (product) => product.images)
product!: Product;

// Product ↔ Category (Many-to-Many)
@ManyToMany(() => Category, (category) => category.products)
@JoinTable({ name: "product_category" })
categories?: Category[];
```

## 🛡️ Security Layers

### 1. Authentication (authenticate middleware)
- Verify JWT token
- Load user from database
- Check user is active

### 2. Authorization (authorize middleware)
- Check user role
- Enforce role-based access control

### 3. Input Validation (validate middleware)
- express-validator schemas
- Type checking
- Length constraints
- Format validation

### 4. Password Security
- bcrypt hashing (10 rounds)
- No plain text storage
- Compare hashed passwords

### 5. SQL Injection Protection
- TypeORM parameterized queries
- No raw SQL with user input

### 6. Error Handling
- Custom error classes (AppError, NotFoundError, etc.)
- Global error handler
- No sensitive info in errors (production)

## 📊 Error Handling Strategy

### Custom Error Classes

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
```

### Global Error Handler

```typescript
app.use(errorHandler);

// Catches all errors
// Returns consistent JSON response
// Logs in development
// Hides stack traces in production
```

### Error Flow

```
Controller/Service throws error
        ↓
Express catches error
        ↓
errorHandler middleware
        ↓
JSON response: { success: false, error: message, statusCode }
```

## 🎨 Design Patterns

### 1. Repository Pattern
- Abstract data access
- Encapsulate TypeORM queries
- Reusable CRUD operations

### 2. Service Layer Pattern
- Isolate business logic
- Coordinate between repositories
- Transaction management

### 3. Dependency Injection
- Controllers inject services
- Services inject repositories
- Loosely coupled components

### 4. Middleware Pattern
- Cross-cutting concerns
- Reusable request processing
- Chain of responsibility

### 5. DTO (Data Transfer Object)
- Type-safe data transfer
- Input validation
- Response formatting

## 🔧 Configuration Management

### Environment Variables (ENV)
```typescript
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000"),
  DB_HOST: process.env.DB_HOST || "localhost",
  // ...
} as const;
```

### Database Configuration
```typescript
export const AppDataSource = new DataSource({
  type: "postgres",
  host: ENV.DB_HOST,
  // ...
  synchronize: ENV.NODE_ENV === "development", // Auto-sync in dev
  logging: ENV.NODE_ENV === "development",     // Log queries in dev
});
```

## 📈 Scalability Considerations

### Current Architecture Supports:

1. **Horizontal Scaling**
   - Stateless API (JWT in client)
   - Database pooling
   - No server-side sessions

2. **Caching** (Future)
   - Redis for session/data cache
   - Query result caching

3. **Load Balancing**
   - Multiple server instances
   - Database read replicas

4. **Microservices** (Future)
   - Services can be extracted
   - Clear boundaries between layers

## 🧪 Testing Strategy (Recommended)

```
backend/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── repositories/
│   ├── integration/
│   │   ├── controllers/
│   │   └── routes/
│   └── e2e/
│       └── api/
```

## 📝 Best Practices Applied

✅ **SOLID Principles**
- Single Responsibility: Each class has one reason to change
- Open/Closed: Extendable without modification
- Liskov Substitution: Derived classes usable as base
- Interface Segregation: Clients not forced to depend on unused methods
- Dependency Inversion: Depend on abstractions

✅ **DRY (Don't Repeat Yourself)**
- BaseRepository for common CRUD
- Reusable middlewares
- Shared validators

✅ **KISS (Keep It Simple)**
- Clear folder structure
- Consistent naming conventions
- Simple data flow

✅ **YAGNI (You Aren't Gonna Need It)**
- No over-engineering
- Features added when needed

## 🚀 Performance Optimizations

### Database
- Indexes on foreign keys
- Eager/Lazy loading optimization
- Query result pagination
- Connection pooling

### API
- Response compression (future)
- Rate limiting (future)
- Caching headers (future)

### Code
- TypeScript strict mode
- Tree-shaking with ES modules
- Async/await for non-blocking I/O

## 📚 Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeORM Documentation](https://typeorm.io/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Version:** 2.0.0  
**Last Updated:** February 2026  
**Architecture by:** Development Team

