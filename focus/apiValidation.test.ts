import request from "supertest";
import app from "../src/index";
import * as db from "../src/db";
import { clearPlates, getPlate } from "../src/db";

describe("PR #3: API Validation and Error Handling", () => {
    beforeEach(() => {
        clearPlates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // =========================================================================
    // 1. POST /api/v1/plate Request Body Validation
    // =========================================================================
    describe("POST /api/v1/plate - Request Body Validation", () => {
        test("returns 400 when request body is completely empty / missing", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .set("Content-Type", "application/json")
                .send();

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test("returns 400 when request body is an array instead of an object", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send([{ fileName: "valid_name.pdf" }]);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test("returns 400 when fileName property is omitted", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ otherField: "test.pdf" });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test("returns 400 when fileName is an empty string", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "" });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test.each([
            ["spaces", "   "],
            ["tabs and newlines", "\t\n  \r\n"],
        ])("returns 400 when fileName contains only whitespace (%s)", async (_, whitespace) => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: whitespace });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test.each([
            ["number", 42],
            ["boolean", true],
            ["boolean false", false],
            ["null", null],
            ["array", ["test.pdf"]],
            ["object", { name: "test.pdf" }],
        ])("returns 400 when fileName is of type %s", async (_, invalidValue) => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: invalidValue });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required",
            });
        });

        test("returns 400 when malformed JSON payload is sent", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .set("Content-Type", "application/json")
                .send('{"fileName": "unfinished_json...');

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "Invalid JSON payload",
            });
        });

        test("ensures invalid requests do NOT create any database records", async () => {
            // Count before
            const invalidPayloads = [
                {},
                { fileName: "" },
                { fileName: "   " },
                { fileName: 999 },
                { fileName: null },
            ];

            for (const payload of invalidPayloads) {
                const res = await request(app)
                    .post("/api/v1/plate")
                    .send(payload);
                expect(res.status).toBe(400);
            }

            // Direct check that table has zero records
            expect(getPlate("00000000-0000-0000-0000-000000000000")).toBeUndefined();
        });

        test("accepts valid filenames with various extensions and creates records", async () => {
            const validCases = [
                ["document.pdf", "pdf"],
                ["image.png", "png"],
                ["photo.jpg", "jpg"],
                ["data.csv", "csv"],
                ["sheet.xlsx", "xlsx"],
            ];

            for (const [input, ext] of validCases) {
                const res = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("id");
                expect(res.body).toHaveProperty("generatedName");
                expect(res.body.generatedName.endsWith(`.${ext}`)).toBe(true);
                expect(res.body.generatedName).not.toContain("__");

                // Confirm persisted
                const stored = getPlate(res.body.id);
                expect(stored).toBeDefined();
                expect(stored?.rawName).toBe(input);
            }
        });

        test("accepts valid extensionless filename and preserves NAKF fallback", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "notes_document" });

            expect(res.status).toBe(201);
            expect(res.body.generatedName.endsWith(".NAKF")).toBe(true);

            const stored = getPlate(res.body.id);
            expect(stored).toBeDefined();
            expect(stored?.rawName).toBe("notes_document");
            expect(stored?.generatedName).toBe(res.body.generatedName);
        });
    });

    // =========================================================================
    // 2. GET /api/v1/plate/:id UUID Validation & Retrieval
    // =========================================================================
    describe("GET /api/v1/plate/:id - UUID Validation", () => {
        test("returns 200 for an existing record with a valid UUID", async () => {
            const postRes = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "flight_ticket.pdf" });

            expect(postRes.status).toBe(201);
            const { id, generatedName } = postRes.body;

            const getRes = await request(app).get(`/api/v1/plate/${id}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body.id).toBe(id);
            expect(getRes.body.rawName).toBe("flight_ticket.pdf");
            expect(getRes.body.generatedName).toBe(generatedName);
            expect(getRes.body).toHaveProperty("createdAt");
        });

        test("returns 404 for a syntactically valid UUID that does not exist", async () => {
            const validNonExistentUuids = [
                "00000000-0000-0000-0000-000000000000",
                "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                "ffffffff-ffff-ffff-ffff-ffffffffffff",
            ];

            for (const nonExistentUuid of validNonExistentUuids) {
                const res = await request(app).get(`/api/v1/plate/${nonExistentUuid}`);
                expect(res.status).toBe(404);
                expect(res.body).toEqual({
                    error: "Plate not found",
                });
            }
        });

        test.each([
            ["arbitrary non-uuid string", "arbitrary-missing-id"],
            ["numeric string", "12345"],
            ["truncated uuid", "550e8400-e29b-41d4-a716"],
            ["uuid with extra trailing chars", "550e8400-e29b-41d4-a716-446655440000-extra"],
            ["uuid with invalid non-hex characters", "550e8400-e29b-41d4-a716-44665544000z"],
            ["path traversal sequence", "../../etc/passwd"],
            ["special characters", "!@#$%^&*()"],
        ])("returns 400 for invalid UUID format: %s (%s)", async (_, invalidId) => {
            const res = await request(app).get(`/api/v1/plate/${encodeURIComponent(invalidId)}`);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "Invalid plate id",
            });
        });
    });

    // =========================================================================
    // 3. Error Handling & 500 Server Errors
    // =========================================================================
    describe("Consistent Error Handling and 500 Responses", () => {
        test("returns 500 with consistent JSON error and no stack trace when POST database operation fails", async () => {
            // Mock savePlate to simulate a database failure
            jest.spyOn(db, "savePlate").mockImplementationOnce(() => {
                throw new Error("SQLite disk I/O error");
            });

            // Suppress console.error in test output for clean logs
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "train_ticket.pdf" });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: "Internal server error",
            });
            // Ensure no stack trace or internal message exposed to client
            expect(res.body).not.toHaveProperty("stack");
            expect(JSON.stringify(res.body)).not.toContain("SQLite disk I/O error");

            expect(consoleSpy).toHaveBeenCalled();
        });

        test("returns 500 with consistent JSON error and no stack trace when GET database lookup fails", async () => {
            // Mock getPlate to simulate a database failure
            jest.spyOn(db, "getPlate").mockImplementationOnce(() => {
                throw new Error("Database connection lost");
            });

            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const validUuid = "550e8400-e29b-41d4-a716-446655440000";
            const res = await request(app).get(`/api/v1/plate/${validUuid}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: "Internal server error",
            });
            expect(res.body).not.toHaveProperty("stack");
            expect(JSON.stringify(res.body)).not.toContain("Database connection lost");

            expect(consoleSpy).toHaveBeenCalled();
        });
    });
});
