import { ContactStatus, UserRole, MediaType } from "@entities/index";

// ============= Product DTOs =============
export interface CreateProductDto {
  name: string;
  slug?: string;
  sku?: string;
  price?: number;
  short_description?: string;
  description?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
  in_stock?: boolean;
  category_ids?: string[];
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  short_description?: string;
  description?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
  in_stock?: boolean;
}

export interface ProductFilterDto {
  category_id?: string;
  category_ids?: string[];
  searchKey?: string;
  is_active?: boolean;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  tags?: string[];
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
  include_descendants?: boolean;
}

// ============= Category DTOs =============
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  media_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  media_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

// ============= Media DTOs =============
export interface CreateMediaDto {
  file_name?: string;
  file_url: string;
  media_type?: MediaType;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  sort_order?: number;
  product_id?: string;
  is_active?: boolean;
}

export interface UpdateMediaDto {
  file_name?: string;
  file_url?: string;
  media_type?: MediaType;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  sort_order?: number;
  product_id?: string;
  is_active?: boolean;
}

export interface MediaFilterDto {
  media_type?: MediaType;
  product_id?: string;
  is_active?: boolean;
}

// ============= Contact DTOs =============
export interface CreateContactDto {
  name: string;
  phone: string;
  address?: string;
  message?: string;
}

export interface UpdateContactDto {
  status?: ContactStatus;
}

// ============= Profile DTOs =============
export interface CreateProfileDto {
  username: string;
  password: string;
  company_name?: string;
  phone?: string;
  address?: string;
  email?: string;
  logo?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UpdateProfileDto {
  company_name?: string;
  phone?: string;
  address?: string;
  email?: string;
  logo?: string;
  is_active?: boolean;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ============= Auth DTOs =============
export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    company_name?: string;
    email?: string;
    role: UserRole;
  };
  message?: string;
}

