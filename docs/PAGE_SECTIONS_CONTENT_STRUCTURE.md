# Page Sections JSONB Content Structure Documentation

## Overview
The `page_sections` table uses JSONB for flexible content storage. This document defines the standard structure for each section type.

---

## Table Structure

```sql
CREATE TABLE page_sections (
  id UUID PRIMARY KEY,
  page_identifier VARCHAR(100),      -- 'homepage', 'about', etc.
  section_identifier VARCHAR(100),   -- 'intro', 'banner', etc.
  content JSONB,                     -- Section-specific content
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_identifier, section_identifier)
);
```

---

## Page Identifiers

| Identifier | Description |
|------------|-------------|
| `homepage` | Main landing page |
| `about`    | About us page |
| `contact`  | Contact page |

---

## Section Types & Content Structure

### 1. **Intro Section** (`intro`)

Welcome text/introduction for the page.

**Content Schema:**
```typescript
{
  text: string;        // HTML or plain text content
  title?: string;      // Optional title
  subtitle?: string;   // Optional subtitle
}
```

**Example:**
```json
{
  "title": "Welcome to Our Store",
  "subtitle": "Quality motorcycle electronics since 2020",
  "text": "<p>Chào mừng bạn đến với cửa hàng điện tử xe máy <strong>Nam Tông</strong>.</p><p>Chúng tôi chuyên cung cấp các thiết bị điện tử chất lượng cao.</p>"
}
```

---

### 2. **Banner Section** (`banner`)

Carousel/slider banners managed through the banner system.

**Content Schema:**
```typescript
{
  banner_ids: string[];     // Array of banner UUIDs in display order
  auto_play?: boolean;      // Auto-play carousel (default: true)
  interval?: number;        // Auto-play interval in ms (default: 3000)
  show_arrows?: boolean;    // Show prev/next arrows (default: true)
  show_dots?: boolean;      // Show pagination dots (default: true)
}
```

**Example:**
```json
{
  "banner_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "auto_play": true,
  "interval": 5000,
  "show_arrows": true,
  "show_dots": true
}
```

**Notes:**
- Banner images are managed in the `banners` table
- `banner_ids` order determines display order
- Invalid/deleted banner IDs are filtered out during display

---

### 3. **Highlight Categories** (`highlight_categories`) *(Future)*

Featured product categories.

**Content Schema:**
```typescript
{
  title: string;            // Section title
  limit: number;            // Max categories to display
  mode: 'auto' | 'manual';  // Auto-select or manual
  category_ids?: string[];  // Manual: Array of category UUIDs
  layout?: 'grid' | 'carousel';
  show_description?: boolean;
}
```

**Example:**
```json
{
  "title": "Danh mục nổi bật",
  "limit": 6,
  "mode": "auto",
  "layout": "grid",
  "show_description": true
}
```

---

### 4. **Highlight Products** (`highlight_products`) *(Future)*

Featured products.

**Content Schema:**
```typescript
{
  title: string;            // Section title
  limit: number;            // Max products to display
  mode: 'auto' | 'manual';  // Auto-select or manual
  filter_by?: 'latest' | 'most_viewed' | 'random';
  product_ids?: string[];   // Manual: Array of product UUIDs
  layout?: 'grid' | 'carousel';
  show_price?: boolean;
}
```

**Example:**
```json
{
  "title": "Sản phẩm nổi bật",
  "limit": 6,
  "mode": "auto",
  "filter_by": "most_viewed",
  "layout": "grid",
  "show_price": true
}
```

---

## API Endpoints

### Admin APIs (Require Authentication + Manager Role)

#### 1. Get Page Sections
```
GET /api/admin/page-sections/:pageIdentifier
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "page_identifier": "homepage",
      "section_identifier": "intro",
      "content": { ... },
      "sort_order": 0,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. Update Page Sections
```
PUT /api/admin/page-sections/:pageIdentifier
```

**Request Body:**
```json
{
  "sections": [
    {
      "sectionIdentifier": "intro",
      "content": {
        "text": "Welcome text"
      },
      "sortOrder": 0,
      "isActive": true
    },
    {
      "sectionIdentifier": "banner",
      "content": {
        "banner_ids": ["uuid1", "uuid2"]
      },
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

**Response:**
```json
{
  "message": "Page sections updated successfully",
  "data": [...]
}
```

#### 3. Delete Section
```
DELETE /api/admin/page-sections/:id
```

### Public APIs (No Authentication)

#### Get Active Sections
```
GET /api/public/page-sections/:pageIdentifier
```

Returns only active sections ordered by `sort_order`.

---

## TypeScript Types

```typescript
// Base section interface
interface PageSection {
  id: string;
  page_identifier: string;
  section_identifier: string;
  content: Record<string, any>;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Content types for each section
interface IntroContent {
  title?: string;
  subtitle?: string;
  text: string;
}

interface BannerContent {
  banner_ids: string[];
  auto_play?: boolean;
  interval?: number;
  show_arrows?: boolean;
  show_dots?: boolean;
}

interface HighlightCategoriesContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';
  category_ids?: string[];
  layout?: 'grid' | 'carousel';
  show_description?: boolean;
}

interface HighlightProductsContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';
  filter_by?: 'latest' | 'most_viewed' | 'random';
  product_ids?: string[];
  layout?: 'grid' | 'carousel';
  show_price?: boolean;
}
```

---

## Usage Examples

### Backend: Creating Default Homepage Sections

```typescript
const sections = [
  {
    page_identifier: 'homepage',
    section_identifier: 'intro',
    content: {
      title: 'Welcome',
      text: '<p>Welcome to our store!</p>'
    },
    sort_order: 0,
    is_active: true
  },
  {
    page_identifier: 'homepage',
    section_identifier: 'banner',
    content: {
      banner_ids: [],
      auto_play: true,
      interval: 5000
    },
    sort_order: 1,
    is_active: true
  }
];
```

### Frontend: Rendering Sections

```typescript
// Fetch sections
const { data: sections } = useGetPageSectionsQuery('homepage');

// Render based on section_identifier
sections?.forEach(section => {
  switch (section.section_identifier) {
    case 'intro':
      return <IntroSection content={section.content} />;
    case 'banner':
      return <BannerSection content={section.content} />;
    // ... more cases
  }
});
```

---

## Validation Rules

1. **Required Fields:**
   - `page_identifier`: Must not be empty
   - `section_identifier`: Must not be empty
   - `content`: Must be valid JSON object

2. **Unique Constraint:**
   - Combination of `page_identifier` + `section_identifier` must be unique

3. **Content Validation:**
   - Each section type has its own content schema
   - Validate on the backend before saving
   - Frontend should validate before API calls

4. **Sort Order:**
   - Must be non-negative integer
   - Lower numbers display first

---

## Best Practices

1. **Content Updates:**
   - Always update multiple sections atomically using the batch update API
   - Include unchanged sections in the update request

2. **Banner Management:**
   - Delete banners from `banners` table separately
   - Update `banner_ids` in section content when reordering

3. **Backward Compatibility:**
   - When adding new content fields, make them optional
   - Provide defaults for missing fields during rendering

4. **Performance:**
   - Cache public sections with appropriate TTL
   - Use database indexes on `page_identifier` and `is_active`

---

## Migration & Seeds

### Initial Data Seed

```sql
-- Homepage intro section
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'intro',
  '{"title": "Chào mừng", "text": "Chào mừng đến với cửa hàng"}'::jsonb,
  0,
  true
);

-- Homepage banner section  
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'banner',
  '{"banner_ids": [], "auto_play": true, "interval": 5000}'::jsonb,
  1,
  true
);
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-03-01 | Initial documentation for `intro` and `banner` sections |

---

## Future Enhancements

- [ ] Add `highlight_categories` section
- [ ] Add `highlight_products` section
- [ ] Add `custom_html` section type
- [ ] Add `testimonials` section
- [ ] Add `newsletter` section
- [ ] Version history for content changes
- [ ] Content preview before publish
