import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, message } = req.body;
  await pool.query(
    "insert into contact(name, phone, message) values($1,$2,$3)",
    [name, phone, message]
  );
  res.json({ success: true });
});

export default router;
