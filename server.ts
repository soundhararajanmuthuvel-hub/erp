import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Trust proxy for rate limiting behind nginx
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development/Vite compatibility
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("CRITICAL: MONGODB_URI or MONGO_URI is not defined in environment variables.");
  console.error("Please set MONGODB_URI in your .env file or environment settings.");
  console.error("Falling back to local connection attempt (likely to fail in cloud environments)...");
}

mongoose.connect(MONGODB_URI || "mongodb://localhost:27017/erp_db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Ensure your MongoDB instance is running and accessible.");
  });

// --- API Routes ---
import authRoutes from "./server/routes/authRoutes";
import rawMaterialRoutes from "./server/routes/rawMaterialRoutes";
import finishedProductRoutes from "./server/routes/finishedProductRoutes";
import productionRoutes from "./server/routes/productionRoutes";
import salesRoutes from "./server/routes/salesRoutes";
import reportRoutes from "./server/routes/reportRoutes";
import bomRoutes from "./server/routes/bomRoutes";
import customerRoutes from "./server/routes/customerRoutes";
import accountingRoutes from "./server/routes/accountingRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/finished-products", finishedProductRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/accounting", accountingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ERP Backend is running" });
});

// --- Vite Middleware for Development ---
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
