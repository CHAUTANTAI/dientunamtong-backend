import express from "express";
import multer from "multer";
import { pool } from "../db.js";
import { sendSuccess, sendError } from "../services/response.js";
import { uploadFile, deleteFile, getPublicUrl } from "../services/supabase.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();
const upload = multer();

// Admin: POST /api/admin/product/:id/image - upload image to Supabase Storage
adminRouter.post("/:id/image", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params; // product id
    const file = req.file;
    if (!file) return sendError(res, "file is required", 400);
    
    // Validate product exists
    const productCheck = await pool.query(`SELECT id FROM product WHERE id = $1 LIMIT 1`, [id]);
    if (!productCheck.rows[0]) return sendError(res, "Product not found", 404);

    const filename = `${randomUUID()}_${file.originalname}`;
    const path = `product/${filename}`;
    const { data: uploadData, error: uploadErr } = await uploadFile("content", path, file.buffer, file.mimetype);
    if (uploadErr) throw uploadErr;

    // store storage path in image_url column
    const imageId = randomUUID();
    const sort_order = 0;
    const q = `INSERT INTO product_image(id, product_id, image_url, sort_order, created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *`;
    
    let rows;
    try {
      const result = await pool.query(q, [imageId, id, path, sort_order]);
      rows = result.rows;
    } catch (dbErr) {
      // Rollback: delete uploaded file if DB insert fails
      await deleteFile("content", [path]);
      throw dbErr;
    }
    
    const publicUrl = getPublicUrl("content", path);
    const resultData = { ...rows[0], public_url: publicUrl };
    return sendSuccess(res, resultData, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: DELETE /api/admin/product/image/:imageId - delete DB record and storage file
adminRouter.delete("/image/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const q = `SELECT image_url FROM product_image WHERE id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [imageId]);
    if (!rows[0]) return sendError(res, "Not found", 404);
    const path = rows[0].image_url;
    // delete DB record
    await pool.query(`DELETE FROM product_image WHERE id = $1`, [imageId]);
    if (path) {
      await deleteFile("content", [path]);
    }
    return sendSuccess(res, { success: true });
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: PUT /api/admin/product/image/:imageId/sort - update sort_order
adminRouter.put("/image/:imageId/sort", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { sort_order } = req.body;
    const q = `UPDATE product_image SET sort_order = $1 WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(q, [sort_order, imageId]);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

export default router;
export { adminRouter };
