import express from "express";
import { pool } from "../db.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();

// Client: POST /api/contact - create contact (name + phone required)
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, message } = req.body;
    if (!name || !phone) return res.status(400).json({ status: 400, data: null, message: "name and phone are required" });
    const id = randomUUID();
    const q = `INSERT INTO contact(id, name, phone, address, message, status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,'new',NOW(),NOW()) RETURNING *`;
    const { rows } = await pool.query(q, [id, name, phone, address, message]);
    return res.status(201).json({ status: 201, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: GET /api/admin/contact - list
adminRouter.get("/", async (req, res) => {
  try {
    const q = `SELECT * FROM contact ORDER BY created_at DESC`;
    const { rows } = await pool.query(q);
    return res.json({ status: 200, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: GET /api/admin/contact/:id
adminRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `SELECT * FROM contact WHERE id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [id]);
    if (!rows[0]) return res.status(404).json({ status: 404, data: null, message: "Not found" });
    return res.json({ status: 200, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

// Admin: DELETE /api/admin/contact/:id
adminRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `DELETE FROM contact WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(q, [id]);
    return res.json({ status: 200, data: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
});

export default router;
export { adminRouter };
