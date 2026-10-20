import request from "supertest";
import app from "../src/index";
import { parseFileName } from "../src/nameParser";
import { generateDateCode, generatePlateName } from "../src/plateService";
import { getPlate, clearPlates } from "../src/db";

// Canonical fixed date (October 20, 2026 -> date code "201026")
const FIXED_DATE = new Date(2026, 9, 20);

interface RealWorldTestCase {
    name: string;
    rawFileName: string;
    expectedExtension: string;
    expectedBasePrefix: string;
    expectedDeterministicPlate: string;
}

const realWorldCases: RealWorldTestCase[] = [
    {
        name: "Train ticket",
        rawFileName: "train_ticket.pdf",
        expectedExtension: "pdf",
        expectedBasePrefix: "trn_tckt_usen_",
        expectedDeterministicPlate: "trn_tckt_usen_201026.pdf",
    },
    {
        name: "Bus ticket",
        rawFileName: "bus_ticket.pdf",
        expectedExtension: "pdf",
        expectedBasePrefix: "bus_tckt_usen_",
        expectedDeterministicPlate: "bus_tckt_usen_201026.pdf",
    },
    {
        name: "Flight ticket",
        rawFileName: "flight_ticket.pdf",
        expectedExtension: "pdf",
        expectedBasePrefix: "flgh_tckt_usen_",
        expectedDeterministicPlate: "flgh_tckt_usen_201026.pdf",
    },
    {
        name: "Bank documents",
        rawFileName: "bank_statement.pdf",
        expectedExtension: "pdf",
        expectedBasePrefix: "bank_sttm_usen_",
        expectedDeterministicPlate: "bank_sttm_usen_201026.pdf",
    },
    {
        name: "Cinema ticket",
        rawFileName: "cinema_ticket.png",
        expectedExtension: "png",
        expectedBasePrefix: "cnm_tckt_usen_",
        expectedDeterministicPlate: "cnm_tckt_usen_201026.png",
    },
];

describe("Open Plate Real-World Document Naming and Persistence Tests", () => {
    beforeEach(() => {
        clearPlates();
        delete process.env.PLATFORM;
    });

    afterEach(() => {
        delete process.env.PLATFORM;
    });

    describe("Deterministic Service-Level Filename Generation", () => {
        test.each(realWorldCases)(
            "$name: generates exact expected filename with deterministic date code",
            ({ rawFileName, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(rawFileName);
                const generated = generatePlateName(parsed, FIXED_DATE);

                expect(generated).toBe(expectedDeterministicPlate);
                expect(generated.endsWith(`.${expectedExtension}`)).toBe(true);
                expect(generated).not.toContain("__");
            }
        );
    });

    describe("Complete API Workflow (POST /api/v1/plate -> GET /api/v1/plate/:id) & SQLite Persistence", () => {
        test.each(realWorldCases)(
            "$name: processes '$rawFileName', returns valid plate, persists in SQLite, and retrieves successfully",
            async ({ rawFileName, expectedExtension, expectedBasePrefix }) => {
                const expectedDateCode = generateDateCode();
                const expectedGeneratedName = `${expectedBasePrefix}${expectedDateCode}.${expectedExtension}`;

                // 1. Send creation request via HTTP POST
                const postResponse = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: rawFileName });

                // 2. Verify API acceptance and response structure
                expect(postResponse.status).toBe(201);
                expect(postResponse.body).toHaveProperty("id");
                expect(postResponse.body).toHaveProperty("generatedName");

                const { id, generatedName } = postResponse.body;

                // Validate UUID format
                expect(typeof id).toBe("string");
                expect(id).toMatch(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                );

                // 3. Verify exact generated filename and invariants
                expect(generatedName).toBe(expectedGeneratedName);
                expect(generatedName.endsWith(`.${expectedExtension}`)).toBe(true);
                expect(generatedName).not.toContain("__");
                expect(generatedName).not.toMatch(/\s/);

                // 4. Verify record retrieval via HTTP GET
                const getResponse = await request(app).get(`/api/v1/plate/${id}`);
                expect(getResponse.status).toBe(200);
                expect(getResponse.body.id).toBe(id);
                expect(getResponse.body.rawName).toBe(rawFileName);
                expect(getResponse.body.generatedName).toBe(generatedName);
                expect(getResponse.body).toHaveProperty("createdAt");

                // 5. Direct verification of SQLite persistence
                const storedRecord = getPlate(id);
                expect(storedRecord).toBeDefined();
                expect(storedRecord?.id).toBe(id);
                expect(storedRecord?.rawName).toBe(rawFileName);
                expect(storedRecord?.generatedName).toBe(generatedName);
                expect(storedRecord?.createdAt).toBe(getResponse.body.createdAt);
            }
        );
    });

    describe("NAKF Fallback Handling for Extensionless Input", () => {
        test("preserves NAKF fallback for extensionless real-world ticket", async () => {
            const rawFileName = "train_ticket";
            const expectedDateCode = generateDateCode();
            const expectedGeneratedName = `trn_tckt_usen_${expectedDateCode}.NAKF`;

            const postResponse = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: rawFileName });

            expect(postResponse.status).toBe(201);
            const { id, generatedName } = postResponse.body;

            expect(generatedName).toBe(expectedGeneratedName);
            expect(generatedName.endsWith(".NAKF")).toBe(true);
            expect(generatedName).not.toContain("__");

            const getResponse = await request(app).get(`/api/v1/plate/${id}`);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.rawName).toBe(rawFileName);
            expect(getResponse.body.generatedName).toBe(generatedName);

            const storedRecord = getPlate(id);
            expect(storedRecord).toBeDefined();
            expect(storedRecord?.rawName).toBe(rawFileName);
            expect(storedRecord?.generatedName).toBe(generatedName);
        });
    });
});
