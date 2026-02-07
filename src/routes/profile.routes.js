import express from "express";
import { pool } from "../db.js";
import { sendSuccess, sendError } from "../services/response.js";
import { randomUUID } from "crypto";

const router = express.Router();
const adminRouter = express.Router();

// Client: GET /api/profile - return single profile (no username/password)
router.get("/", async (req, res) => {
  try {
    const q = `SELECT id, company_name, phone, address, email, logo, is_active, created_at, updated_at FROM profile ORDER BY created_at LIMIT 1`;
    const { rows } = await pool.query(q);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: GET /api/admin/profile - return full profile (without password)
adminRouter.get("/", async (req, res) => {
  try {
    const q = `SELECT id, company_name, phone, address, email, username, logo, is_active, created_at, updated_at FROM profile ORDER BY created_at LIMIT 1`;
    const { rows } = await pool.query(q);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: POST /api/admin/login - simple username/password check
adminRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return sendError(res, "username and password required", 400);
    const q = `SELECT id FROM profile WHERE username = $1 AND password = $2 LIMIT 1`;
    const { rows } = await pool.query(q, [username, password]);
    const success = rows.length > 0;
    return sendSuccess(res, { success });
  } catch (err) {
    return sendError(res, err.message);
  }
});

// Admin: PUT /api/admin/profile - update allowed fields
adminRouter.put("/", async (req, res) => {
  try {
    const { company_name, phone, address, email, logo, is_active } = req.body;
    const q = `UPDATE profile SET company_name = $1, phone = $2, address = $3, email = $4, logo = $5, is_active = $6, updated_at = NOW() RETURNING *`;
    const values = [company_name, phone, address, email, logo, is_active];
    const { rows } = await pool.query(q, values);
    return sendSuccess(res, rows[0] || null);
  } catch (err) {
    return sendError(res, err.message);
  }
});

export default router;
export { adminRouter };
