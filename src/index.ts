import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { initializeDatabase } from "@config/database";
import { ENV } from "@config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "@middlewares/index";

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.config();
  }

  private config(): void {
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    // Allow credentials and restrict origin to frontend app in development/production.
    const frontendOrigin = ENV.APP_PUBLIC_URL || 'http://localhost:3000';
    this.app.use(
      cors({
        origin: frontendOrigin,
        credentials: true,
      })
    );

    // Response logging middleware (development only)
    this.app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function (data) {
        if (ENV.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log(`✅ Response sent: ${req.method} ${req.path} - Status: ${res.statusCode}`);
        }
        return originalSend.call(this, data);
      };
      next();
    });

    // API routes
    this.app.use("/api", routes);

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: ENV.NODE_ENV,
      });
    });

    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await initializeDatabase();

      // Start server
      this.app.listen(ENV.PORT, () => {
        const r2Ready =
          (ENV.R2_ENDPOINT || ENV.R2_ACCOUNT_ID) &&
          ENV.R2_ACCESS_KEY_ID &&
          ENV.R2_SECRET_ACCESS_KEY &&
          ENV.R2_BUCKET_NAME;
        if (!r2Ready) {
          console.warn(
            "\n⚠️  R2 env missing: set R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in backend/.env — storage proxy and uploads will fail until then.\n"
          );
        }
        console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 Server Started Successfully!             ║
║                                                ║
║   📡 Port: ${ENV.PORT.toString().padEnd(38)}║
║   🌍 Environment: ${ENV.NODE_ENV.padEnd(31)}║
║   📝 API Docs: http://localhost:${ENV.PORT}/api${" ".repeat(10)}║
║   ❤️  Health: http://localhost:${ENV.PORT}/health${" ".repeat(7)}║
║                                                ║
╚════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Start server
const server = new Server();
server.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

