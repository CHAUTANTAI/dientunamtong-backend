import { Request, Response, NextFunction } from "express";
import { ProductService } from "@services/ProductService";
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: ProductFilterDto = {
        category_id: req.query.category_id as string,
        searchKey: req.query.searchKey as string,
        is_active: req.query.is_active === "true" ? true : undefined,
        limit: parseInt(req.query.limit as string) || 10,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const products = await this.productService.getAllProducts(filters);

      const response: ApiResponse = {
        success: true,
        data: products,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      const response: ApiResponse = {
        success: true,
        data: product,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDto: CreateProductDto = req.body;
      const product = await this.productService.createProduct(createDto);

      const response: ApiResponse = {
        success: true,
        data: product,
        message: "Product created successfully",
        statusCode: 201,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateProductDto = req.body;
      const product = await this.productService.updateProduct(id, updateDto);

      const response: ApiResponse = {
        success: true,
        data: product,
        message: "Product updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);

      const response: ApiResponse = {
        success: true,
        message: "Product deleted successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProductCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { category_ids } = req.body;

      await this.productService.updateProductCategories(id, category_ids);

      const response: ApiResponse = {
        success: true,
        message: "Product categories updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

