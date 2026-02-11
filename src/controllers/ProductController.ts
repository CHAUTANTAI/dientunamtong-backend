import { Request, Response, NextFunction } from "express";
import { ProductService } from "@services/ProductService";
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from "@/types/dtos";
import { ApiResponse, successResponse } from "@/types/responses";

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
        category_ids: req.query.category_ids
          ? (req.query.category_ids as string).split(",")
          : undefined,
        searchKey: req.query.searchKey as string,
        is_active: req.query.is_active === "true" ? true : undefined,
        in_stock: req.query.in_stock === "true" ? true : undefined,
        min_price: req.query.min_price
          ? parseFloat(req.query.min_price as string)
          : undefined,
        max_price: req.query.max_price
          ? parseFloat(req.query.max_price as string)
          : undefined,
        tags: req.query.tags
          ? (req.query.tags as string).split(",")
          : undefined,
        sort_by: (req.query.sort_by as string) || "created_at",
        sort_order: (req.query.sort_order as "ASC" | "DESC") || "DESC",
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
        include_descendants: req.query.include_descendants === "true",
      };

      const result = await this.productService.getAllProducts(filters);

      res.json(successResponse(result, "Products retrieved successfully"));
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
      const incrementView = req.query.increment_view === "true";
      const product = await this.productService.getProductById(id, incrementView);

      res.json(successResponse(product, "Product retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const incrementView = req.query.increment_view === "true";
      const product = await this.productService.getProductBySlug(slug, incrementView);

      res.json(successResponse(product, "Product retrieved successfully"));
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

      res
        .status(201)
        .json(successResponse(product, "Product created successfully"));
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

      res.json(successResponse(product, "Product updated successfully"));
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

      res.json(successResponse(null, "Product deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  hardDeleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.hardDeleteProduct(id);

      res.json(
        successResponse(null, "Product permanently deleted successfully")
      );
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

      res.json(
        successResponse(null, "Product categories updated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  getRelatedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 8;

      const products = await this.productService.getRelatedProducts(id, limit);

      res.json(
        successResponse(products, "Related products retrieved successfully", {
          count: products.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getFeaturedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await this.productService.getFeaturedProducts(limit);

      res.json(
        successResponse(products, "Featured products retrieved successfully", {
          count: products.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getProductsByTag = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { tag } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const products = await this.productService.getProductsByTag(tag, limit);

      res.json(
        successResponse(products, "Products retrieved successfully", {
          count: products.length,
          tag,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getAllTags = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tags = await this.productService.getAllTags();

      res.json(
        successResponse(tags, "Tags retrieved successfully", {
          count: tags.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategorySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;

      const filters: ProductFilterDto = {
        searchKey: req.query.searchKey as string,
        is_active: req.query.is_active === "true" ? true : undefined,
        in_stock: req.query.in_stock === "true" ? true : undefined,
        min_price: req.query.min_price
          ? parseFloat(req.query.min_price as string)
          : undefined,
        max_price: req.query.max_price
          ? parseFloat(req.query.max_price as string)
          : undefined,
        tags: req.query.tags
          ? (req.query.tags as string).split(",")
          : undefined,
        sort_by: (req.query.sort_by as string) || "created_at",
        sort_order: (req.query.sort_order as "ASC" | "DESC") || "DESC",
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
        include_descendants: req.query.include_descendants === "true",
      };

      const result = await this.productService.getProductsByCategorySlug(
        slug,
        filters
      );

      res.json(
        successResponse(result, "Products by category retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}

