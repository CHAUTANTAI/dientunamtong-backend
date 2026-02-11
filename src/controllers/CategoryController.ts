import { Request, Response, NextFunction } from "express";
import { CategoryService } from "@services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";

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

      const response: ApiResponse = {
        success: true,
        data: categories,
        statusCode: 200,
      };

      res.status(200).json(response);
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

      const response: ApiResponse = {
        success: true,
        data: category,
        statusCode: 200,
      };

      res.status(200).json(response);
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

      const response: ApiResponse = {
        success: true,
        data: category,
        message: "Category created successfully",
        statusCode: 201,
      };

      res.status(201).json(response);
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

      const response: ApiResponse = {
        success: true,
        data: category,
        message: "Category updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
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
      await this.categoryService.deleteCategory(id);

      const response: ApiResponse = {
        success: true,
        message: "Category deleted successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

