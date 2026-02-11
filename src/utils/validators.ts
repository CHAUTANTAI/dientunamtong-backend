import { body, param, query } from "express-validator";

// ============= Auth Validators =============
export const loginValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Username must be between 3 and 100 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ============= Product Validators =============
export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Product name must not exceed 255 characters"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be non-negative"),
  body("short_description")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Short description must not exceed 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters"),
  body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
];

export const updateProductValidator = [
  param("id").isUUID().withMessage("Invalid product ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Product name must not exceed 255 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters"),
  body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
];

export const productIdValidator = [
  param("id").isUUID().withMessage("Invalid product ID"),
];

export const productCategoriesValidator = [
  param("id").isUUID().withMessage("Invalid product ID"),
  body("category_ids")
    .isArray()
    .withMessage("category_ids must be an array")
    .custom((value) => value.every((id: any) => typeof id === "string"))
    .withMessage("All category_ids must be strings"),
];

// ============= Category Validators =============
export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 255 })
    .withMessage("Category name must not exceed 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
];

export const updateCategoryValidator = [
  param("id").isUUID().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 255 })
    .withMessage("Category name must not exceed 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
];

export const categoryIdValidator = [
  param("id").isUUID().withMessage("Invalid category ID"),
];

// ============= Contact Validators =============
export const createContactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must not exceed 255 characters"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ max: 50 })
    .withMessage("Phone must not exceed 50 characters"),
  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),
  body("message")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Message must not exceed 2000 characters"),
];

export const updateContactValidator = [
  param("id").isUUID().withMessage("Invalid contact ID"),
  body("status")
    .optional()
    .isIn(["new", "processing", "completed", "cancelled"])
    .withMessage("Invalid status value"),
];

export const contactIdValidator = [
  param("id").isUUID().withMessage("Invalid contact ID"),
];

// ============= Profile Validators =============
export const updateProfileValidator = [
  body("company_name")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Company name must not exceed 255 characters"),
  body("phone")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Phone must not exceed 50 characters"),
  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),
  body("logo")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Logo URL must not exceed 500 characters"),
  body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
];

export const updatePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

