import { ContactStatus, UserRole } from "@entities/index";

// ============= Product DTOs =============
export interface CreateProductDto {
  name: string;
  price?: number;
  short_description?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  short_description?: string;
  description?: string;
  is_active?: boolean;
}

export interface ProductFilterDto {
  category_id?: string;
  searchKey?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

// ============= Category DTOs =============
export interface CreateCategoryDto {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
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

// ============= Product Image DTOs =============
export interface AddProductImageDto {
  product_id: string;
  image_url: string;
  sort_order?: number;
}

export interface UpdateProductImageSortDto {
  sort_order: number;
}

