import { Router, Request, Response, NextFunction } from "express";
import { createPlate } from "./plateService";
import { savePlate, getPlate } from "./db";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
    return UUID_REGEX.test(id);
}

const router = Router();

router.get("/health", (_req: Request, res: Response): void => {
    res.status(200).json({ status: "ok" });
});

/**
 * @openapi
 * /api/v1/plate:
 *   post:
 *     summary: Generate a standardized Open Plate filename
 *     description: Takes a raw filename, generates a standardized filename, stores it, and returns its UUID.
 *     tags:
 *       - Plate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: google chrome passwords.csv
 *     responses:
 *       201:
 *         description: Plate created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 550e8400-e29b-41d4-a716-446655440000
 *                 generatedName:
 *                   type: string
 *                   example: gogl_chrm_pswd_usen_201026.csv
 *       400:
 *         description: Invalid request.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/api/v1/plate",
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
                res.status(400).json({
                    error: "fileName is required"
                });
                return;
            }

            const { fileName } = req.body;

            if (
                typeof fileName !== "string" ||
                fileName.trim().length === 0
            ) {
                res.status(400).json({
                    error: "fileName is required"
                });
                return;
            }

            const plate = createPlate(fileName);

            savePlate(plate, fileName);

            res.status(201).json({
                id: plate.id,
                generatedName: plate.generatedName
            });
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @openapi
 * /api/v1/plate/{id}:
 *   get:
 *     summary: Retrieve a stored Open Plate record
 *     description: Returns a previously generated plate using its UUID.
 *     tags:
 *       - Plate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the stored plate.
 *     responses:
 *       200:
 *         description: Plate retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 rawName:
 *                   type: string
 *                 generatedName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid plate id.
 *       404:
 *         description: Plate not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/api/v1/plate/:id",
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            const id = req.params.id;

            if (!id || typeof id !== "string" || !isValidUuid(id)) {
                res.status(400).json({
                    error: "Invalid plate id"
                });
                return;
            }

            const plate = getPlate(id);

            if (!plate) {
                res.status(404).json({
                    error: "Plate not found"
                });
                return;
            }

            res.json(plate);
        } catch (err) {
            next(err);
        }
    }
);

export default router;