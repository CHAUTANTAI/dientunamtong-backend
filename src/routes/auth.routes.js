import express from "express";
import { pool } from "../db.js";
import { sendSuccess, sendError } from "../services/response.js";

const router = express.Router();

// POST /api/auth/login - simple username/password check
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return sendError(res, "username and password required", 400);
    const q = `SELECT * FROM profile WHERE username = $1 AND password = $2 LIMIT 1`;
    const { rows } = await pool.query(q, [username, password]);
    const success = rows.length > 0;
    const token = crypto.randomUUID();
    return sendSuccess(res, { user: rows[0], success, token });
  } catch (err) {
    return sendError(res, err.message);
  }
});

export default router;
