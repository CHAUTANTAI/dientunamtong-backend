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
    this.app.use(cors());

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

