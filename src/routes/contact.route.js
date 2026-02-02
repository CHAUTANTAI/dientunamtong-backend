import express from "express";
import { pool } from "../db.js";
import { sendSuccess, sendError } from "../services/response.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();

// Client: POST /api/contact - create contact (name + phone required)
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, message } = req.body;
    if (!name || !phone) return sendError(res, "name and phone are required", 400);
    const id = randomUUID();
    const q = `INSERT INTO contact(id, name, phone, address, message, status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,'new',NOW(),NOW()) RETURNING *`;
    const { rows } = await pool.query(q, [id, name, phone, address, message]);
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: GET /api/admin/contact - list
adminRouter.get("/", async (req, res) => {
  try {
    const q = `SELECT * FROM contact ORDER BY created_at DESC`;
    const { rows } = await pool.query(q);
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: GET /api/admin/contact/:id
adminRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `SELECT * FROM contact WHERE id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [id]);
    if (!rows[0]) return sendError(res, "Not found", 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: DELETE /api/admin/contact/:id
adminRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `DELETE FROM contact WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(q, [id]);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

export default router;
export { adminRouter };
