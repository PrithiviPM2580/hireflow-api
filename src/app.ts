//! ============================================================
//! 🚀 App — Application setup and configuration
//! ============================================================
import "@/openapi/zod-openapi";
import express, { type Express } from "express";
import helmet from "helmet";
import hpp from "hpp-clean";
import errorHandler from "@/middlewares/error-handler.middleware";
import cors from "@/utils/cors.util";
import morgan from "@/utils/morgan.util";
import sanitize from "@/utils/sanitizer.util";
import swaggerOptions from "./config/swagger.config";
import compressResponse from "./middlewares/compression.middleware";
import router from "./routes/index.route";

//-- ------------------------------------------------------
//--  App : Application Instance
//-- ------------------------------------------------------
const app: Express = express();

//-- ------------------------------------------------------
//--  Middlewares
//-- ------------------------------------------------------
app.use(helmet()); // Security headers
app.use(hpp({ keepFirst: true })); // Prevent HTTP Parameter Pollution
app.use(cors); // Enable CORS
app.use(sanitize()); // Sanitize request data to prevent NoSQL injection and XSS attacks
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse incoming URL-encoded requests
app.use(morgan.successLoggerMiddleware); // Log successful requests
app.use(morgan.errorLoggerMiddleware); // Log error requests
app.use(compressResponse); // Compress response bodies for all requests
app.use("/api-docs", ...swaggerOptions); // Set up Swagger UI for API documentation

//-- ------------------------------------------------------
//--  Router
//-- ------------------------------------------------------
app.use(router);

//-- ------------------------------------------------------
//--  Error Handler
//-- ------------------------------------------------------
app.use(errorHandler); // Global error handler

export default app;
