import express from "express";
import swaggerUi from "swagger-ui-express";

import router from "./router";
import swaggerSpec from "./swagger";

const app = express();

/**
 * ---------------------------------------------------------
 * Middleware
 * ---------------------------------------------------------
 */

// Parse JSON request bodies
app.use(express.json());

/**
 * ---------------------------------------------------------
 * API Routes
 * ---------------------------------------------------------
 */

app.use(router);

/**
 * ---------------------------------------------------------
 * Swagger Documentation
 * ---------------------------------------------------------
 */

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

/**
 * ---------------------------------------------------------
 * Error Handling Middleware
 * ---------------------------------------------------------
 */

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
    // Handle malformed JSON body from express.json()
    if (err instanceof SyntaxError && "status" in err && err.status === 400) {
        res.status(400).json({
            error: "Invalid JSON payload"
        });
        return;
    }

    console.error("Internal Server Error:", err);

    res.status(500).json({
        error: "Internal server error"
    });
});

/**
 * ---------------------------------------------------------
 * Server
 * ---------------------------------------------------------
 */

const PORT = process.env.PORT || 3000;

// Only start the server when this file is run directly.
// This prevents Jest/Supertest from opening another server.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Open Plate API running on http://localhost:${PORT}`
        );
        console.log(
            `Swagger UI available at http://localhost:${PORT}/docs`
        );
    });
}

export default app;