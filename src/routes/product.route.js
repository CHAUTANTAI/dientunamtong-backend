import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "select * from product where is_active = true order by id desc"
  );
  res.json(rows);
});

// CREATE product
router.post("/", async (req, res) => {
  const { name, description, image_url } = req.body;
  await pool.query(
    "insert into product(name, description, image_url) values($1,$2,$3)",
    [name, description, image_url]
  );
  res.json({ success: true });
});

export default router;
