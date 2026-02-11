import { Request, Response, NextFunction } from "express";
import { CategoryService } from "@services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "@/types/dtos";
import { ApiResponse, successResponse } from "@/types/responses";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const activeOnly = req.query.active === "true";
      const categories = await this.categoryService.getAllCategories(activeOnly);

      res.json(
        successResponse(categories, "Categories retrieved successfully", {
          count: categories.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      res.json(successResponse(category, "Category retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const category = await this.categoryService.getCategoryBySlug(slug);

      res.json(successResponse(category, "Category retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDto: CreateCategoryDto = req.body;
      const category = await this.categoryService.createCategory(createDto);

      res
        .status(201)
        .json(successResponse(category, "Category created successfully"));
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateCategoryDto = req.body;
      const category = await this.categoryService.updateCategory(id, updateDto);

      res.json(successResponse(category, "Category updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const cascade = req.query.cascade === "true";
      await this.categoryService.deleteCategory(id, cascade);

      res.json(successResponse(null, "Category deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  hardDeleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const cascade = req.query.cascade === "true";
      await this.categoryService.hardDeleteCategory(id, cascade);

      res.json(
        successResponse(null, "Category permanently deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  // Tree-specific endpoints
  getRootCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.categoryService.getRootCategories();

      res.json(
        successResponse(categories, "Root categories retrieved successfully", {
          count: categories.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getChildrenOf = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const categories = await this.categoryService.getChildrenOf(id);

      res.json(
        successResponse(categories, "Child categories retrieved successfully", {
          count: categories.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getCategoryTree = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const tree = await this.categoryService.getCategoryTree(id);

      res.json(successResponse(tree, "Category tree retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  getFullCategoryTree = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tree = await this.categoryService.getCategoryTree();

      res.json(
        successResponse(tree, "Full category tree retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getBreadcrumb = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const breadcrumb = await this.categoryService.getBreadcrumb(id);

      res.json(
        successResponse(breadcrumb, "Category breadcrumb retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  moveCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { parent_id } = req.body;

      const category = await this.categoryService.moveCategory(
        id,
        parent_id || null
      );

      res.json(successResponse(category, "Category moved successfully"));
    } catch (error) {
      next(error);
    }
  };

  searchCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          message: "Search query parameter 'q' is required",
        });
        return;
      }

      const categories = await this.categoryService.searchCategories(q);

      res.json(
        successResponse(categories, "Category search completed", {
          count: categories.length,
          query: q,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

