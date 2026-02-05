import "dotenv/config";

import express from "express";
import cors from "cors";

import productRoute, { adminRouter as productAdminRouter } from "./routes/product.route.js";
import contactRoute, { adminRouter as contactAdminRouter } from "./routes/contact.route.js";
import profileRoute, { adminRouter as profileAdminRouter } from "./routes/profile.routes.js";
import categoryRoute, { adminRouter as categoryAdminRouter } from "./routes/category.routes.js";
import productImageRoute, { adminRouter as productImageAdminRouter, uploadRouter as productImageUploadRouter } from "./routes/productImage.routes.js";
import authRoute from "./routes/auth.routes.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/product", productRoute);
app.use("/api/contact", contactRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);

// Admin mounts
app.use("/api/admin/product", productAdminRouter);
app.use("/api/admin/product", productImageUploadRouter); // Legacy upload endpoint
app.use("/api/admin/product-image", productImageAdminRouter);
app.use("/api/admin/contact", contactAdminRouter);
app.use("/api/admin/profile", profileAdminRouter);
app.use("/api/admin/category", categoryAdminRouter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
