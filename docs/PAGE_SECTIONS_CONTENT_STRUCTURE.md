# Page Sections JSONB Content Structure Documentation

## Overview
The `page_sections` table uses JSONB for flexible content storage. This document defines the standard structure for each section type.

---

## Table Structure

```sql
CREATE TABLE page_sections (
  id UUID PRIMARY KEY,
  page_identifier VARCHAR(100),      -- 'homepage', 'about', etc.
  section_identifier VARCHAR(100),   -- 'banner_header', 'slider_section', etc.
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

### LAYOUT SECTIONS (Shared across pages)

#### 1. **Banner Header** (`banner_header`)

Logo, banner image, and hotline numbers displayed at the top.

**Content Schema:**
```typescript
{
  logo_media_id?: string;          // Company logo path
  banner_media_id?: string;        // Banner image path
  primary_hotline?: string;        // Main phone number
  secondary_hotline?: string;      // Secondary phone number
}
```

**Example:**
```json
{
  "logo_media_id": "logos/company-logo.png",
  "banner_media_id": "banners/main-banner.jpg",
  "primary_hotline": "(0286) 271 3025",
  "secondary_hotline": "0909 60 30 25"
}
```

---

#### 2. **Mega Menu** (`mega_menu`)

Navigation menu with static items (categories are auto-fetched from DB).

**Content Schema:**
```typescript
{
  static_items: Array<{
    id: string;
    label: string;
    href: string;
    sort_order: number;
  }>;
}
```

**Example:**
```json
{
  "static_items": [
    {
      "id": "price-list",
      "label": "Bảng giá",
      "href": "/bang-gia",
      "sort_order": 0
    },
    {
      "id": "stickers",
      "label": "Tem xe",
      "href": "/tem-xe",
      "sort_order": 1
    },
    {
      "id": "videos",
      "label": "Video",
      "href": "/videos",
      "sort_order": 2
    }
  ]
}
```

---

#### 3. **Search Slogan** (`search_slogan`)

Marquee text displayed with search bar.

**Content Schema:**
```typescript
{
  slogan_text: string;             // Marquee text
}
```

**Example:**
```json
{
  "slogan_text": "Chuyên cung cấp phụ tùng xe máy chính hãng - Giao hàng toàn quốc"
}
```

---

#### 4. **Slider Section** (`slider_section`)

Main carousel slider with mini ads.

**Content Schema:**
```typescript
{
  slides: Array<{
    id: string;
    media_id: string;        // Image path
    link?: string;           // Optional click target
    alt?: string;            // Alt text (deprecated)
    sort_order: number;
  }>;
  mini_ads: Array<{
    id: string;
    media_id: string;
    link?: string;
    alt?: string;            // Alt text (deprecated)
    sort_order: number;
  }>;
  slider_settings?: {
    height?: number;
    autoplay?: boolean;
    autoplay_speed?: number;
  };
  mini_ad_settings?: {
    height?: number;
    gap?: number;
  };
}
```

**Example:**
```json
{
  "slides": [
    {
      "id": "slide-1",
      "media_id": "sliders/promo-2024.jpg",
      "link": "/promotions/tet-2024",
      "sort_order": 0
    }
  ],
  "mini_ads": [
    {
      "id": "ad-1",
      "media_id": "ads/mini-ad-1.jpg",
      "link": "/products/bi-led",
      "sort_order": 0
    }
  ],
  "slider_settings": {
    "height": 400,
    "autoplay": true,
    "autoplay_speed": 3000
  },
  "mini_ad_settings": {
    "height": 195,
    "gap": 10
  }
}
```

---

### HOMEPAGE CONTENT SECTIONS

#### 5. **Trending Keywords** (`trending_keywords_section`)

Search keywords section with auto/manual mode.

**Content Schema:**
```typescript
{
  mode: 'auto' | 'manual';         // auto: top 5 categories + top 5 products by views
  keywords: Array<{
    id: string;
    text: string;                  // Display text
    link: string;                  // Click target
    source: 'category' | 'product'; // Source type
    source_id: string;             // Category ID or Product ID
    sort_order: number;
  }>;
}
```

**Example:**
```json
{
  "mode": "manual",
  "keywords": [
    {
      "id": "kw-1",
      "text": "Bi LED",
      "link": "/categories/bi-led",
      "source": "category",
      "source_id": "cat-uuid-123",
      "sort_order": 0
    },
    {
      "id": "kw-2",
      "text": "Tem xe Winner X",
      "link": "/products/tem-winner-x",
      "source": "product",
      "source_id": "prod-uuid-456",
      "sort_order": 1
    }
  ]
}
```

---

#### 6. **Products Section** (`products_section`)

Multi-category products display with auto/manual mode per category.

**Content Schema:**
```typescript
{
  categories?: Array<{
    category_id: string;
    mode: 'auto' | 'manual';       // auto: top 6 by views, manual: select specific
    product_ids?: string[];        // For manual mode (max 6 products)
  }>;                              // Max 3 categories
}
```

**Example:**
```json
{
  "categories": [
    {
      "category_id": "cat-bi-led",
      "mode": "auto"
    },
    {
      "category_id": "cat-tem-xe",
      "mode": "manual",
      "product_ids": ["prod-1", "prod-2", "prod-3"]
    }
  ]
}
```

**Notes:**
- Max 3 categories allowed
- Each category shows 6 products
- Auto mode: top 6 by view_count
- Manual mode: admin selects specific products
- Products from child categories are also included (recursive)

---

#### 7. **Left Sidebar** (`left_sidebar`)

Category tree menu with auto/manual mode.

**Content Schema:**
```typescript
{
  mode: 'auto' | 'manual';         // auto: top 8 by views, manual: select specific
  category_ids?: string[];         // For manual mode (max 8 categories)
  max_items?: number;              // Default: 8
}
```

**Example:**
```json
{
  "mode": "auto",
  "max_items": 8
}
```

**Example (Manual):**
```json
{
  "mode": "manual",
  "category_ids": ["cat-1", "cat-2", "cat-3"],
  "max_items": 8
}
```

**Notes:**
- Tree selection is independent (selecting parent ≠ auto-select children)
- Subcategories are displayed automatically for selected categories

---

#### 8. **Right Sidebar** (`right_sidebar`)

News items and promotional banners.

**Content Schema:**
```typescript
{
  news_items: Array<{
    id: string;
    title: string;
    link: string;
    date?: string;
    sort_order: number;
  }>;
  promotional_banners?: Array<{
    id: string;
    media_id: string;            // Image path
    link?: string;
    alt?: string;
    sort_order: number;
  }>;
}
```

**Example:**
```json
{
  "news_items": [
    {
      "id": "news-1",
      "title": "Ra mắt sản phẩm bi LED mới",
      "link": "/news/bi-led-2024",
      "date": "2024-03-01",
      "sort_order": 0
    }
  ],
  "promotional_banners": [
    {
      "id": "banner-1",
      "media_id": "banners/promo-sidebar.jpg",
      "link": "/promotions/spring-sale",
      "sort_order": 0
    }
  ]
}
```

---

## Section Identifiers (Current)

```typescript
export type SectionIdentifier = 
  // Layout sections
  | 'banner_header'
  | 'mega_menu'
  | 'search_slogan'
  | 'slider_section'
  
  // HomePage content sections
  | 'trending_keywords_section'
  | 'products_section'
  | 'left_sidebar'
  | 'right_sidebar';
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
      "section_identifier": "banner_header",
      "content": { ... },
      "sort_order": 0,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. Update Page Sections (Batch)
```
PUT /api/admin/page-sections/:pageIdentifier
```

**Request Body:**
```json
{
  "sections": [
    {
      "sectionIdentifier": "banner_header",
      "content": {
        "logo_media_id": "logos/logo.png"
      },
      "sortOrder": 0,
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

See `frontend/src/types/pageSection.ts` for complete type definitions.

**Key Interfaces:**
- `BannerHeaderContent`
- `MegaMenuContent`
- `SearchSloganContent`
- `SliderContent`
- `TrendingKeywordsContent`
- `ProductsSectionContent`
- `LeftSidebarContent`
- `RightSidebarContent`

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
   - Layout sections: 0-3
   - Homepage content sections: 4-7

---

## Best Practices

1. **Content Updates:**
   - Always update multiple sections atomically using the batch update API
   - Include all sections in the update request (even unchanged ones)

2. **Media Management:**
   - Use Supabase public bucket for all media
   - Store paths in content (not full URLs)
   - Validate image dimensions before upload

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
-- Banner Header
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'banner_header',
  '{"logo_media_id": "", "banner_media_id": "", "primary_hotline": "(0286) 271 3025", "secondary_hotline": "0909 60 30 25"}'::jsonb,
  0,
  true
);

-- Mega Menu
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'mega_menu',
  '{"static_items": []}'::jsonb,
  1,
  true
);

-- Search Slogan
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'search_slogan',
  '{"slogan_text": "Chuyên cung cấp phụ tùng xe máy chính hãng"}'::jsonb,
  2,
  true
);

-- Slider Section
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'slider_section',
  '{"slides": [], "mini_ads": [], "slider_settings": {}, "mini_ad_settings": {}}'::jsonb,
  3,
  true
);

-- Trending Keywords
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'trending_keywords_section',
  '{"mode": "auto", "keywords": []}'::jsonb,
  4,
  true
);

-- Products Section
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'products_section',
  '{"categories": []}'::jsonb,
  5,
  true
);

-- Left Sidebar
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'left_sidebar',
  '{"mode": "auto", "max_items": 8}'::jsonb,
  6,
  true
);

-- Right Sidebar
INSERT INTO page_sections (id, page_identifier, section_identifier, content, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'homepage',
  'right_sidebar',
  '{"news_items": [], "promotional_banners": []}'::jsonb,
  7,
  true
);
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-03-01 | Initial documentation |
| 2.0.0 | 2026-03-18 | Complete redesign: Added BannerHeader, MegaMenu, SearchSlogan, updated Products/LeftSidebar schemas |

---

## Future Enhancements

- [ ] Add `custom_html` section type
- [ ] Add `testimonials` section
- [ ] Add `newsletter` section
- [ ] Version history for content changes
- [ ] Content preview before publish
- [ ] A/B testing for sections

---

**Document Version:** 2.0.0  
**Last Updated:** 2026-03-18  
**Status:** ✅ Current & Accurate
