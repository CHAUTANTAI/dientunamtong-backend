import express from "express";
import { pool } from "../db.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();

// Client: GET /api/category - only active categories
router.get("/", async (req, res) => {
  try {
    const q = `SELECT id, name, description, is_active, created_at, updated_at FROM category WHERE is_active = true ORDER BY name`;
    const { rows } = await pool.query(q);
    return res.json({ status: 200, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: GET /api/admin/category - list all categories
adminRouter.get("/", async (req, res) => {
  try {
    const q = `SELECT * FROM category ORDER BY created_at DESC`;
    const { rows } = await pool.query(q);
    return res.json({ status: 200, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: POST /api/admin/category - create
adminRouter.post("/", async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const id = randomUUID();
    const q = `INSERT INTO category(id, name, description, is_active, created_at, updated_at) VALUES($1,$2,$3,COALESCE($4,true),NOW(),NOW()) RETURNING *`;
    const { rows } = await pool.query(q, [id, name, description, is_active]);
    return res.json({ status: 201, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: PUT /api/admin/category/:id - update
adminRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const q = `UPDATE category SET name=$1, description=$2, is_active=$3, updated_at=NOW() WHERE id=$4 RETURNING *`;
    const { rows } = await pool.query(q, [name, description, is_active, id]);
    return res.json({ status: 200, data: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: DELETE /api/admin/category/:id - soft delete
adminRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `UPDATE category SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(q, [id]);
    return res.json({ status: 200, data: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

export default router;
export { adminRouter };
