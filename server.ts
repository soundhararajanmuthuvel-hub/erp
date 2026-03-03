import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// DB Connection Check Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && req.path !== '/api/health' && req.path !== '/api/debug' && mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection is not ready. Please ensure MONGO_URI is correctly set and your IP is whitelisted in MongoDB Atlas.',
      dbState: mongoose.connection.readyState
    });
  }
  next();
});

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
import companyRoutes from "./server/routes/companyRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/finished-products", finishedProductRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/company", companyRoutes);

app.get("/api/debug", (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    dbReadyState: mongoose.connection.readyState,
    mongodbUriSet: !!MONGODB_URI
  });
});

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
    
    // SPA Fallback for development
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      try {
        const url = req.originalUrl;
        const template = await (await import("fs/promises")).readFile(path.resolve(__dirname, "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, "dist");
    const fs = await import("fs");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(503).send("Application is not built. Please run 'npm run build' first.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

setupVite();
