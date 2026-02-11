# 📚 API Documentation

Complete API reference for Backend v2.0

**Base URL:** `http://localhost:4000/api`

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Categories](#categories)
- [Contacts](#contacts)
- [Profile](#profile)
- [Product Images](#product-images)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Login

**POST** `/auth/login`

Login and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "company_name": "Điện Tử Nam Tông",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "statusCode": 200
}
```

**Validation:**
- `username`: Required, 3-100 characters
- `password`: Required, min 6 characters

---

### Logout

**POST** `/auth/logout`

**Auth Required:** ✅ Bearer Token

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully",
  "statusCode": 200
}
```

---

### Get Current User

**GET** `/auth/me`

**Auth Required:** ✅ Bearer Token

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "company_name": "Điện Tử Nam Tông",
    "email": "admin@example.com",
    "role": "admin"
  },
  "statusCode": 200
}
```

---

## 🛍️ Products

### Get All Products (Public)

**GET** `/product`

Get all active products.

**Query Parameters:**
- `category_id` (optional): Filter by category
- `searchKey` (optional): Search in product name
- `limit` (optional): Default 10
- `offset` (optional): Default 0

**Example:**
```bash
GET /product?category_id=uuid&searchKey=laptop&limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": 100000,
      "short_description": "Short desc",
      "description": "Full description",
      "is_active": true,
      "created_at": "2026-02-11T...",
      "updated_at": "2026-02-11T...",
      "images": [
        {
          "id": "uuid",
          "image_url": "/product/filename.jpg",
          "sort_order": 0,
          "created_at": "2026-02-11T..."
        }
      ],
      "categories": [
        {
          "id": "uuid",
          "name": "Category Name"
        }
      ]
    }
  ],
  "statusCode": 200
}
```

---

### Get Product Detail (Public)

**GET** `/product/:id`

**Response:** `200 OK` (same structure as above, single object)

---

### Get All Products (Admin)

**GET** `/admin/product`

**Auth Required:** ✅ Admin Role

Get all products including inactive ones.

**Query Parameters:** Same as public endpoint

---

### Get Product Detail (Admin)

**GET** `/admin/product/:id`

**Auth Required:** ✅ Admin Role

---

### Create Product

**POST** `/admin/product`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "name": "New Product",
  "price": 100000,
  "short_description": "Short description",
  "description": "Full description",
  "is_active": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Product",
    "price": 100000,
    "short_description": "Short description",
    "description": "Full description",
    "is_active": true,
    "created_at": "2026-02-11T...",
    "updated_at": "2026-02-11T..."
  },
  "message": "Product created successfully",
  "statusCode": 201
}
```

**Validation:**
- `name`: Required, max 255 characters
- `price`: Optional, numeric, >= 0
- `short_description`: Optional, max 255 characters
- `description`: Optional, max 5000 characters
- `is_active`: Optional, boolean

---

### Update Product

**PUT** `/admin/product/:id`

**Auth Required:** ✅ Admin Role

**Request:** (all fields optional)
```json
{
  "name": "Updated Product",
  "price": 150000,
  "short_description": "Updated desc",
  "description": "Updated full description",
  "is_active": false
}
```

**Response:** `200 OK`

---

### Delete Product (Soft Delete)

**DELETE** `/admin/product/:id`

**Auth Required:** ✅ Admin Role

Sets `is_active = false`.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "statusCode": 200
}
```

---

### Update Product Categories

**PUT** `/admin/product/:id/category`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "category_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product categories updated successfully",
  "statusCode": 200
}
```

---

## 📁 Categories

### Get Categories (Public)

**GET** `/category`

Get all active categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Category Name",
      "description": "Description",
      "is_active": true,
      "created_at": "2026-02-11T...",
      "updated_at": "2026-02-11T..."
    }
  ],
  "statusCode": 200
}
```

---

### Get All Categories (Admin)

**GET** `/admin/category`

**Auth Required:** ✅ Admin Role

**Query Parameters:**
- `active`: `true` | `false` (optional)

---

### Get Category Detail (Admin)

**GET** `/admin/category/:id`

**Auth Required:** ✅ Admin Role

---

### Create Category

**POST** `/admin/category`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "name": "New Category",
  "description": "Description",
  "is_active": true
}
```

**Response:** `201 Created`

**Validation:**
- `name`: Required, max 255 characters, unique
- `description`: Optional, max 1000 characters
- `is_active`: Optional, boolean

---

### Update Category

**PUT** `/admin/category/:id`

**Auth Required:** ✅ Admin Role

**Request:** (all fields optional)
```json
{
  "name": "Updated Category",
  "description": "Updated description",
  "is_active": false
}
```

**Response:** `200 OK`

---

### Delete Category (Soft Delete)

**DELETE** `/admin/category/:id`

**Auth Required:** ✅ Admin Role

**Response:** `200 OK`

---

## 📧 Contacts

### Create Contact (Public)

**POST** `/contact`

Submit contact form.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "0123456789",
  "address": "123 Street, City",
  "message": "I want to inquire about..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "0123456789",
    "address": "123 Street, City",
    "message": "I want to inquire about...",
    "status": "new",
    "created_at": "2026-02-11T...",
    "updated_at": "2026-02-11T..."
  },
  "message": "Contact created successfully",
  "statusCode": 201
}
```

**Validation:**
- `name`: Required, max 255 characters
- `phone`: Required, max 50 characters
- `address`: Optional, max 500 characters
- `message`: Optional, max 2000 characters

---

### Get All Contacts (Admin)

**GET** `/admin/contact`

**Auth Required:** ✅ Admin Role

**Query Parameters:**
- `status`: `new` | `processing` | `completed` | `cancelled` (optional)

**Response:** `200 OK` (array of contacts)

---

### Get Contact Detail (Admin)

**GET** `/admin/contact/:id`

**Auth Required:** ✅ Admin Role

---

### Update Contact Status (Admin)

**PUT** `/admin/contact/:id`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "status": "processing"
}
```

**Response:** `200 OK`

**Status Values:**
- `new` - New contact (default)
- `processing` - Being handled
- `completed` - Resolved
- `cancelled` - Cancelled

---

### Delete Contact (Admin)

**DELETE** `/admin/contact/:id`

**Auth Required:** ✅ Admin Role

**Response:** `200 OK`

---

## 🏢 Profile

### Get Public Profile

**GET** `/profile`

Get company information (public).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_name": "Điện Tử Nam Tông",
    "phone": "0123456789",
    "address": "Address here",
    "email": "info@company.com",
    "logo": "/logo.png"
  },
  "statusCode": 200
}
```

---

### Get Full Profile (Admin)

**GET** `/admin/profile`

**Auth Required:** ✅ Admin Role

Returns full profile including admin fields.

---

### Update Profile (Admin)

**PUT** `/admin/profile`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "company_name": "Updated Company Name",
  "phone": "0987654321",
  "address": "New address",
  "email": "newemail@company.com",
  "logo": "/new-logo.png",
  "is_active": true
}
```

**Response:** `200 OK`

**Validation:**
- `company_name`: Optional, max 255 characters
- `phone`: Optional, max 50 characters
- `address`: Optional, max 500 characters
- `email`: Optional, valid email, max 255 characters
- `logo`: Optional, max 500 characters

---

### Change Password (Admin)

**PUT** `/admin/profile/password`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password updated successfully",
  "statusCode": 200
}
```

**Validation:**
- `currentPassword`: Required, min 6 characters
- `newPassword`: Required, min 6 characters

---

## 🖼️ Product Images

### Get Product Images (Admin)

**GET** `/admin/product/:id/images`

**Auth Required:** ✅ Admin Role

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "image_url": "/product/filename.jpg",
      "sort_order": 0,
      "created_at": "2026-02-11T..."
    }
  ],
  "statusCode": 200
}
```

---

### Add Product Image (Admin)

**POST** `/admin/product-image`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "product_id": "uuid",
  "image_url": "/product/filename.jpg",
  "sort_order": 0
}
```

**Response:** `201 Created`

**Note:** Image should be uploaded to Supabase Storage first, then add record here.

---

### Upload Product Image (Admin - Legacy)

**POST** `/admin/product/:id/image`

**Auth Required:** ✅ Admin Role

**Content-Type:** `multipart/form-data`

**Request:**
```
file: <image file>
```

**Response:** `201 Created`

Uploads to Supabase Storage and creates DB record automatically.

---

### Delete Product Image (Admin)

**DELETE** `/admin/product-image/:imageId`

**Auth Required:** ✅ Admin Role

**Response:** `200 OK`

Deletes from DB and Supabase Storage.

---

### Update Image Sort Order (Admin)

**PUT** `/admin/product-image/:imageId/sort`

**Auth Required:** ✅ Admin Role

**Request:**
```json
{
  "sort_order": 1
}
```

**Response:** `200 OK`

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

### Common Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "No token provided",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "You do not have permission to access this resource",
  "statusCode": 403
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Product with id xxx not found",
  "statusCode": 404
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": "name: Name is required, price: Price must be a number",
  "statusCode": 400
}
```

---

## 🔒 Authentication

### How to Authenticate

1. **Login** to get JWT token
2. **Include token** in all protected requests:

```bash
curl http://localhost:4000/api/admin/product \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Expiration

Default: **7 days** (configurable in `.env`)

When token expires, you'll receive `401 Unauthorized`. Login again to get new token.

---

## 📊 Rate Limiting

Currently: **No rate limiting** (to be added in future)

Recommended for production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## 🧪 Testing with cURL

### Example: Create Product

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' \
  | jq -r '.data.token')

# 2. Create Product
curl -X POST http://localhost:4000/api/admin/product \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "price": 100000,
    "short_description": "Test product",
    "is_active": true
  }'
```

---

## 📚 Postman Collection

**Coming soon:** Import-ready Postman collection with all endpoints.

---

**API Version:** 2.0  
**Last Updated:** February 2026  
**Base URL:** http://localhost:4000/api

