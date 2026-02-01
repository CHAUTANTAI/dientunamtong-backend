import "dotenv/config";

import express from "express";
import cors from "cors";

import productRoute from "./routes/product.route.js";
import contactRoute from "./routes/contact.route.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/product", productRoute);
app.use("/api/contact", contactRoute);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
