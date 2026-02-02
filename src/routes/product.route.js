import express from "express";
import { pool } from "../db.js";
import { sendSuccess, sendError } from "../services/response.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();

// Helper to build filters
function buildListQuery({ isAdmin = false, category_id, searchKey }) {
  const where = [];
  const params = [];
  let idx = 1;
  if (!isAdmin) {
    where.push(`p.is_active = true`);
  }
  if (category_id) {
    where.push(`EXISTS (SELECT 1 FROM product_category pc WHERE pc.product_id = p.id AND pc.category_id = $${idx})`);
    params.push(category_id);
    idx++;
  }
  if (searchKey) {
    where.push(`p.name ILIKE $${idx}`);
    params.push(`%${searchKey}%`);
    idx++;
  }
  const whereClause = where.length ? `WHERE ` + where.join(" AND ") : "";
  const q = `SELECT p.id, p.name, p.price, p.short_description, p.is_active, p.created_at, p.updated_at FROM product p ${whereClause} ORDER BY p.created_at DESC`;
  return { q, params };
}

// Client: GET /api/product - list with optional filters
router.get("/", async (req, res) => {
  try {
    const { category_id, searchKey, limit = 10, offset = 0 } = req.query;
    const { q, params } = buildListQuery({ isAdmin: false, category_id, searchKey });
    const finalQ = q + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const values = [...params, parseInt(limit, 10), parseInt(offset, 10)];
    const { rows } = await pool.query(finalQ, values);
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Client: GET /api/product/:id - detail with images and categories
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `SELECT id, name, price, short_description, description, is_active, created_at, updated_at FROM product WHERE id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [id]);
    if (!rows[0]) return sendError(res, "Not found", 404);
    const product = rows[0];
    const imgQ = `SELECT id, image_url, sort_order, created_at FROM product_image WHERE product_id = $1 ORDER BY sort_order ASC`;
    const catQ = `SELECT c.id, c.name FROM category c JOIN product_category pc ON pc.category_id = c.id WHERE pc.product_id = $1`;
    const imgs = (await pool.query(imgQ, [id])).rows;
    const cats = (await pool.query(catQ, [id])).rows;
    product.images = imgs;
    product.categories = cats;
    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: GET /api/admin/product - same as client but include inactive
adminRouter.get("/", async (req, res) => {
  try {
    const { category_id, searchKey, limit = 10, offset = 0 } = req.query;
    const { q, params } = buildListQuery({ isAdmin: true, category_id, searchKey });
    const finalQ = q + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const values = [...params, parseInt(limit, 10), parseInt(offset, 10)];
    const { rows } = await pool.query(finalQ, values);
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: POST /api/admin/product - create product
adminRouter.post("/", async (req, res) => {
  try {
    const { name, price, short_description, description, is_active } = req.body;
    const id = randomUUID();
    const q = `INSERT INTO product(id, name, price, short_description, description, is_active, created_at, updated_at) VALUES($1,$2,$3,$4,$5,COALESCE($6,true),NOW(),NOW()) RETURNING *`;
    const { rows } = await pool.query(q, [id, name, price, short_description, description, is_active]);
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: PUT /api/admin/product/:id - update
adminRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, short_description, description, is_active } = req.body;
    const q = `UPDATE product SET name=$1, price=$2, short_description=$3, description=$4, is_active=$5, updated_at=NOW() WHERE id=$6 RETURNING *`;
    const { rows } = await pool.query(q, [name, price, short_description, description, is_active, id]);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: DELETE /api/admin/product/:id - soft delete
adminRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `UPDATE product SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(q, [id]);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: PUT /api/admin/product/:id/category - replace categories (transaction)
adminRouter.put("/:id/category", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { category_ids } = req.body;
    await client.query("BEGIN");
    await client.query(`DELETE FROM product_category WHERE product_id = $1`, [id]);
    if (Array.isArray(category_ids) && category_ids.length) {
      const insertPromises = category_ids.map((cid) => client.query(`INSERT INTO product_category(product_id, category_id) VALUES($1,$2)`, [id, cid]));
      await Promise.all(insertPromises);
    }
    await client.query("COMMIT");
    return sendSuccess(res, { success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return sendError(res, err.message);
  } finally {
    client.release();
  }
});

export default router;
export { adminRouter };

