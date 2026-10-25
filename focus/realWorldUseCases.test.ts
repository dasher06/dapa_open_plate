import request from "supertest";
import app from "../src/index";
import { parseFileName, ParsedFileName } from "../src/nameParser";
import {
    createPlate,
    generateDateCode,
    generatePlateName,
} from "../src/plateService";
import { getPlate, clearPlates } from "../src/db";

/**
 * Helper to validate structural invariants of an Open Plate generated filename:
 * <place>_<persona>[_<purpose>][_extras...]_<language>_<date>.<extension>
 */
function validatePlateNameStructure(
    generatedName: string,
    expectedExtension: string
): void {
    expect(typeof generatedName).toBe("string");
    expect(generatedName.length).toBeGreaterThan(0);

    // No whitespace anywhere in the filename
    expect(generatedName).not.toMatch(/\s/);

    // No consecutive underscores (invalid empty segments)
    expect(generatedName).not.toContain("__");

    // No dapa prefix
    expect(generatedName.startsWith("dapa_")).toBe(false);

    // Exactly one dot separating base name and extension
    const dotIndex = generatedName.lastIndexOf(".");
    expect(dotIndex).toBeGreaterThan(0);

    const baseName = generatedName.substring(0, dotIndex);
    const extension = generatedName.substring(dotIndex + 1);

    expect(extension).toBe(expectedExtension);

    const segments = baseName.split("_");
    // Must contain at least: language, date (2 segments)
    expect(segments.length).toBeGreaterThanOrEqual(2);

    // Penultimate segment is the language code
    expect(segments[segments.length - 2]).toBe("usen");

    // Last base segment is the date code (numeric, 6 digits: DDMMYY)
    const dateSegment = segments[segments.length - 1];
    expect(dateSegment).toMatch(/^\d{6}$/);

    // Intermediate segments (place, persona, purpose, extras) must be lowercase alphanumeric
    for (let i = 0; i < segments.length - 2; i++) {
        expect(segments[i]).toMatch(/^[a-z0-9]{1,4}$/);
    }
}

// Canonical date used for deterministic filename matching
const FIXED_DATE = new Date(2026, 7, 11); // August 11, 2026 -> date code "110826"

describe("Real-World Use-Case Tests for Open Plate", () => {

    beforeEach(() => {
        clearPlates();
        delete process.env.PLATFORM;
    });

    afterEach(() => {
        delete process.env.PLATFORM;
    });

    // =========================================================================
    // 1. Train Ticket Use Cases
    // =========================================================================
    describe("Train Ticket Use Cases", () => {

        const trainTestCases = [
            {
                input: "chennai_to_bangalore_train_ticket.pdf",
                expectedParsed: {
                    place: "chnn",
                    persona: "bngl",
                    purpose: "trn",
                    extras: ["tckt"],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "chnn_bngl_trn_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "train_ticket_2026.png",
                expectedParsed: {
                    place: "trn",
                    persona: "tckt",
                    purpose: "2026",
                    extras: [],
                    extension: "png",
                },
                expectedDeterministicPlate: "trn_tckt_2026_usen_110826.png",
                expectedExtension: "png",
            },
            {
                input: "train_ticket.pdf",
                expectedParsed: {
                    place: "trn",
                    persona: "tckt",
                    purpose: "",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "trn_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "railway_booking_confirmation.jpg",
                expectedParsed: {
                    place: "rlwy",
                    persona: "bkng",
                    purpose: "cnfr",
                    extras: [],
                    extension: "jpg",
                },
                expectedDeterministicPlate: "rlwy_bkng_cnfr_usen_110826.jpg",
                expectedExtension: "jpg",
            },
        ];

        test.each(trainTestCases)(
            "parses and reduces words correctly for: $input",
            ({ input, expectedParsed }) => {
                const parsed = parseFileName(input);
                expect(parsed).toEqual(expectedParsed);
            }
        );

        test.each(trainTestCases)(
            "generates standardized plate name with deterministic date for: $input",
            ({ input, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(input);
                const generated = generatePlateName(parsed, FIXED_DATE);
                expect(generated).toBe(expectedDeterministicPlate);
                validatePlateNameStructure(generated, expectedExtension);
            }
        );

        test.each(trainTestCases)(
            "processes, creates via API, and retrieves from SQLite for: $input",
            async ({ input, expectedExtension }) => {
                const postRes = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(postRes.status).toBe(201);
                expect(postRes.body).toHaveProperty("id");
                expect(postRes.body).toHaveProperty("generatedName");

                const { id, generatedName } = postRes.body;
                expect(typeof id).toBe("string");
                expect(id).toMatch(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                );

                validatePlateNameStructure(generatedName, expectedExtension);

                // Retrieve through GET endpoint
                const getRes = await request(app).get(`/api/v1/plate/${id}`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.id).toBe(id);
                expect(getRes.body.rawName).toBe(input);
                expect(getRes.body.generatedName).toBe(generatedName);
                expect(getRes.body).toHaveProperty("createdAt");

                // Direct SQLite validation
                const stored = getPlate(id);
                expect(stored).toBeDefined();
                expect(stored?.id).toBe(id);
                expect(stored?.rawName).toBe(input);
                expect(stored?.generatedName).toBe(generatedName);
                expect(stored?.createdAt).toBe(getRes.body.createdAt);
            }
        );

    });

    // =========================================================================
    // 2. Bus Ticket Use Cases
    // =========================================================================
    describe("Bus Ticket Use Cases", () => {

        const busTestCases = [
            {
                input: "redbus_booking_ticket.pdf",
                expectedParsed: {
                    place: "rdbs",
                    persona: "bkng",
                    purpose: "tckt",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "rdbs_bkng_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "chennai_bus_ticket.png",
                expectedParsed: {
                    place: "chnn",
                    persona: "bus",
                    purpose: "tckt",
                    extras: [],
                    extension: "png",
                },
                expectedDeterministicPlate: "chnn_bus_tckt_usen_110826.png",
                expectedExtension: "png",
            },
            {
                input: "bus_ticket.pdf",
                expectedParsed: {
                    place: "bus",
                    persona: "tckt",
                    purpose: "",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "bus_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "intercity_bus_booking.jpg",
                expectedParsed: {
                    place: "intr",
                    persona: "bus",
                    purpose: "bkng",
                    extras: [],
                    extension: "jpg",
                },
                expectedDeterministicPlate: "intr_bus_bkng_usen_110826.jpg",
                expectedExtension: "jpg",
            },
        ];

        test.each(busTestCases)(
            "parses and reduces words correctly for: $input",
            ({ input, expectedParsed }) => {
                const parsed = parseFileName(input);
                expect(parsed).toEqual(expectedParsed);
            }
        );

        test.each(busTestCases)(
            "generates standardized plate name with deterministic date for: $input",
            ({ input, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(input);
                const generated = generatePlateName(parsed, FIXED_DATE);
                expect(generated).toBe(expectedDeterministicPlate);
                validatePlateNameStructure(generated, expectedExtension);
            }
        );

        test.each(busTestCases)(
            "processes, creates via API, and retrieves from SQLite for: $input",
            async ({ input, expectedExtension }) => {
                const postRes = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(postRes.status).toBe(201);
                const { id, generatedName } = postRes.body;

                validatePlateNameStructure(generatedName, expectedExtension);

                const getRes = await request(app).get(`/api/v1/plate/${id}`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.id).toBe(id);
                expect(getRes.body.rawName).toBe(input);
                expect(getRes.body.generatedName).toBe(generatedName);

                const stored = getPlate(id);
                expect(stored).toBeDefined();
                expect(stored?.id).toBe(id);
                expect(stored?.rawName).toBe(input);
                expect(stored?.generatedName).toBe(generatedName);
                expect(stored?.createdAt).toBe(getRes.body.createdAt);
            }
        );

    });

    // =========================================================================
    // 3. Flight Ticket Use Cases
    // =========================================================================
    describe("Flight Ticket Use Cases", () => {

        const flightTestCases = [
            {
                input: "indigo_flight_ticket.pdf",
                expectedParsed: {
                    place: "indg",
                    persona: "flgh",
                    purpose: "tckt",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "indg_flgh_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "flight_booking_confirmation.png",
                expectedParsed: {
                    place: "flgh",
                    persona: "bkng",
                    purpose: "cnfr",
                    extras: [],
                    extension: "png",
                },
                expectedDeterministicPlate: "flgh_bkng_cnfr_usen_110826.png",
                expectedExtension: "png",
            },
            {
                input: "flight_ticket.pdf",
                expectedParsed: {
                    place: "flgh",
                    persona: "tckt",
                    purpose: "",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "flgh_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "international_flight_itinerary.jpg",
                expectedParsed: {
                    place: "intr",
                    persona: "flgh",
                    purpose: "itnr",
                    extras: [],
                    extension: "jpg",
                },
                expectedDeterministicPlate: "intr_flgh_itnr_usen_110826.jpg",
                expectedExtension: "jpg",
            },
        ];

        test.each(flightTestCases)(
            "parses and applies generic consonant reduction without semantic assumptions for: $input",
            ({ input, expectedParsed }) => {
                const parsed = parseFileName(input);
                expect(parsed).toEqual(expectedParsed);
            }
        );

        test.each(flightTestCases)(
            "generates standardized plate name with deterministic date for: $input",
            ({ input, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(input);
                const generated = generatePlateName(parsed, FIXED_DATE);
                expect(generated).toBe(expectedDeterministicPlate);
                validatePlateNameStructure(generated, expectedExtension);
            }
        );

        test.each(flightTestCases)(
            "processes, creates via API, and retrieves from SQLite for: $input",
            async ({ input, expectedExtension }) => {
                const postRes = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(postRes.status).toBe(201);
                const { id, generatedName } = postRes.body;

                validatePlateNameStructure(generatedName, expectedExtension);

                const getRes = await request(app).get(`/api/v1/plate/${id}`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.id).toBe(id);
                expect(getRes.body.rawName).toBe(input);
                expect(getRes.body.generatedName).toBe(generatedName);

                const stored = getPlate(id);
                expect(stored).toBeDefined();
                expect(stored?.id).toBe(id);
                expect(stored?.rawName).toBe(input);
                expect(stored?.generatedName).toBe(generatedName);
                expect(stored?.createdAt).toBe(getRes.body.createdAt);
            }
        );

    });

    // =========================================================================
    // 4. Bank Document Use Cases
    // =========================================================================
    describe("Bank Document Use Cases", () => {

        const bankTestCases = [
            {
                input: "bank_statement.pdf",
                expectedParsed: {
                    place: "bank",
                    persona: "sttm",
                    purpose: "",
                    extras: [],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "bank_sttm_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "hdfc_bank_statement.csv",
                expectedParsed: {
                    place: "hdfc",
                    persona: "bank",
                    purpose: "sttm",
                    extras: [],
                    extension: "csv",
                },
                expectedDeterministicPlate: "hdfc_bank_sttm_usen_110826.csv",
                expectedExtension: "csv",
            },
            {
                input: "bank_transaction_history.xlsx",
                expectedParsed: {
                    place: "bank",
                    persona: "trns",
                    purpose: "hstr",
                    extras: [],
                    extension: "xlsx",
                },
                expectedDeterministicPlate: "bank_trns_hstr_usen_110826.xlsx",
                expectedExtension: "xlsx",
            },
        ];

        test.each(bankTestCases)(
            "parses and reduces words correctly for synthetic bank file: $input",
            ({ input, expectedParsed }) => {
                const parsed = parseFileName(input);
                expect(parsed).toEqual(expectedParsed);
            }
        );

        test.each(bankTestCases)(
            "generates standardized plate name with deterministic date for: $input",
            ({ input, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(input);
                const generated = generatePlateName(parsed, FIXED_DATE);
                expect(generated).toBe(expectedDeterministicPlate);
                validatePlateNameStructure(generated, expectedExtension);
            }
        );

        test.each(bankTestCases)(
            "processes, creates via API, and retrieves from SQLite for: $input",
            async ({ input, expectedExtension }) => {
                const postRes = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(postRes.status).toBe(201);
                const { id, generatedName } = postRes.body;

                validatePlateNameStructure(generatedName, expectedExtension);

                const getRes = await request(app).get(`/api/v1/plate/${id}`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.id).toBe(id);
                expect(getRes.body.rawName).toBe(input);
                expect(getRes.body.generatedName).toBe(generatedName);

                const stored = getPlate(id);
                expect(stored).toBeDefined();
                expect(stored?.id).toBe(id);
                expect(stored?.rawName).toBe(input);
                expect(stored?.generatedName).toBe(generatedName);
                expect(stored?.createdAt).toBe(getRes.body.createdAt);
            }
        );

    });

    // =========================================================================
    // 5. Cinema Ticket Use Cases
    // =========================================================================
    describe("Cinema Ticket Use Cases", () => {

        const cinemaTestCases = [
            {
                input: "imax_movie_booking_ticket.pdf",
                expectedParsed: {
                    place: "imax",
                    persona: "mv",
                    purpose: "bkng",
                    extras: ["tckt"],
                    extension: "pdf",
                },
                expectedDeterministicPlate: "imax_mv_bkng_tckt_usen_110826.pdf",
                expectedExtension: "pdf",
            },
            {
                input: "cinema_ticket.png",
                expectedParsed: {
                    place: "cnm",
                    persona: "tckt",
                    purpose: "",
                    extras: [],
                    extension: "png",
                },
                expectedDeterministicPlate: "cnm_tckt_usen_110826.png",
                expectedExtension: "png",
            },
            {
                input: "movie_booking_confirmation.jpg",
                expectedParsed: {
                    place: "mv",
                    persona: "bkng",
                    purpose: "cnfr",
                    extras: [],
                    extension: "jpg",
                },
                expectedDeterministicPlate: "mv_bkng_cnfr_usen_110826.jpg",
                expectedExtension: "jpg",
            },
        ];

        test.each(cinemaTestCases)(
            "parses and reduces words correctly for: $input",
            ({ input, expectedParsed }) => {
                const parsed = parseFileName(input);
                expect(parsed).toEqual(expectedParsed);
            }
        );

        test.each(cinemaTestCases)(
            "generates standardized plate name with deterministic date for: $input",
            ({ input, expectedDeterministicPlate, expectedExtension }) => {
                const parsed = parseFileName(input);
                const generated = generatePlateName(parsed, FIXED_DATE);
                expect(generated).toBe(expectedDeterministicPlate);
                validatePlateNameStructure(generated, expectedExtension);
            }
        );

        test.each(cinemaTestCases)(
            "processes, creates via API, and retrieves from SQLite for: $input",
            async ({ input, expectedExtension }) => {
                const postRes = await request(app)
                    .post("/api/v1/plate")
                    .send({ fileName: input });

                expect(postRes.status).toBe(201);
                const { id, generatedName } = postRes.body;

                validatePlateNameStructure(generatedName, expectedExtension);

                const getRes = await request(app).get(`/api/v1/plate/${id}`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.id).toBe(id);
                expect(getRes.body.rawName).toBe(input);
                expect(getRes.body.generatedName).toBe(generatedName);

                const stored = getPlate(id);
                expect(stored).toBeDefined();
                expect(stored?.id).toBe(id);
                expect(stored?.rawName).toBe(input);
                expect(stored?.generatedName).toBe(generatedName);
                expect(stored?.createdAt).toBe(getRes.body.createdAt);
            }
        );

    });

    // =========================================================================
    // 6. Filename Format Validation
    // =========================================================================
    describe("Filename Format Validation", () => {

        test("does not include dapa platform prefix", () => {
            const parsed = parseFileName("chennai_bus_ticket.png");
            const name = generatePlateName(parsed, FIXED_DATE);
            expect(name.startsWith("dapa_")).toBe(false);
            expect(name).toBe("chnn_bus_tckt_usen_110826.png");
            validatePlateNameStructure(name, "png");
        });

        test("ignores PLATFORM environment variable and omits prefix", () => {
            process.env.PLATFORM = "myplatform";
            const parsed = parseFileName("chennai_bus_ticket.png");
            const name = generatePlateName(parsed, FIXED_DATE);
            expect(name.startsWith("myplatform_")).toBe(false);
            expect(name.startsWith("dapa_")).toBe(false);
            validatePlateNameStructure(name, "png");
            delete process.env.PLATFORM;
        });

        test("validates DDMMYY date code generation across various dates", () => {
            // Month with leading zero, day with leading zero
            expect(generateDateCode(new Date(2026, 0, 5))).toBe("050126");

            // Month with leading zero, day without leading zero (August 11, 2026)
            expect(generateDateCode(new Date(2026, 7, 11))).toBe("110826");

            // October 20, 2026 -> 201026
            expect(generateDateCode(new Date(2026, 9, 20))).toBe("201026");

            // December 25, 2026 -> 251226
            expect(generateDateCode(new Date(2026, 11, 25))).toBe("251226");
        });

        test("does not duplicate original raw filename in generated plate", () => {
            const raw = "railway_booking_confirmation.jpg";
            const parsed = parseFileName(raw);
            const plate = generatePlateName(parsed, FIXED_DATE);

            expect(plate).not.toContain(raw);
            expect(plate).not.toContain("railway");
            expect(plate).not.toContain("booking");
            expect(plate).not.toContain("confirmation");
            expect(plate).toBe("rlwy_bkng_cnfr_usen_110826.jpg");
        });

        test("ensures components appear in exact canonical order without platform prefix", () => {
            const parsed = parseFileName("chennai_to_bangalore_train_ticket.pdf");
            const plate = generatePlateName(parsed, FIXED_DATE);
            const segments = plate.substring(0, plate.lastIndexOf(".")).split("_");

            expect(segments).toEqual([
                "chnn", // place
                "bngl", // persona
                "trn",  // purpose
                "tckt", // extras[0]
                "usen", // language
                "110826" // date
            ]);
        });

    });

    // =========================================================================
    // 7. Extension Handling
    // =========================================================================
    describe("Extension Handling", () => {

        test.each([
            ["document.pdf", "pdf"],
            ["image.png", "png"],
            ["photo.jpg", "jpg"],
            ["data.csv", "csv"],
            ["sheet.xlsx", "xlsx"],
        ])("preserves supported extension %s as %s", (filename, ext) => {
            const parsed = parseFileName(filename);
            expect(parsed.extension).toBe(ext);
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate.endsWith(`.${ext}`)).toBe(true);
        });

        test("applies NAKF fallback when input has no extension", () => {
            const parsed = parseFileName("train_booking_ticket");
            expect(parsed.extension).toBe("");
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate.endsWith(".NAKF")).toBe(true);
            expect(plate).toBe("trn_bkng_tckt_usen_110826.NAKF");
        });

        test("applies NAKF fallback when input ends with a dot", () => {
            const parsed = parseFileName("train_booking_ticket.");
            expect(parsed.extension).toBe("");
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate.endsWith(".NAKF")).toBe(true);
        });

        test("normalizes uppercase extension to lowercase", () => {
            const parsed = parseFileName("flight_booking_ticket.PDF");
            expect(parsed.extension).toBe("pdf");
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate.endsWith(".pdf")).toBe(true);
            expect(plate).toBe("flgh_bkng_tckt_usen_110826.pdf");
        });

        test("handles filename with multiple dots correctly", () => {
            const parsed = parseFileName("train.ticket.confirmation.pdf");
            expect(parsed.extension).toBe("pdf");
            expect(parsed.place).toBe("trn");
            expect(parsed.persona).toBe("tckt");
            expect(parsed.purpose).toBe("cnfr");
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate).toBe("trn_tckt_cnfr_usen_110826.pdf");
        });

        test("handles filename with leading and trailing whitespace", () => {
            const parsed = parseFileName("   chennai_bus_ticket.png   ");
            expect(parsed.extension).toBe("png");
            expect(parsed.place).toBe("chnn");
            expect(parsed.persona).toBe("bus");
            expect(parsed.purpose).toBe("tckt");
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate).toBe("chnn_bus_tckt_usen_110826.png");
        });

        test("handles filename with multiple mixed spaces, dashes, and underscores", () => {
            const parsed = parseFileName("chennai---to___bangalore   train..ticket.pdf");
            expect(parsed.extension).toBe("pdf");
            expect(parsed.place).toBe("chnn");
            expect(parsed.persona).toBe("bngl");
            expect(parsed.purpose).toBe("trn");
            expect(parsed.extras).toEqual(["tckt"]);
            const plate = generatePlateName(parsed, FIXED_DATE);
            expect(plate).toBe("chnn_bngl_trn_tckt_usen_110826.pdf");
        });

    });

    // =========================================================================
    // 8. SQLite Persistence
    // =========================================================================
    describe("SQLite Persistence", () => {

        test("persists generated record and retrieves with identical fields", () => {
            const record = createPlate("railway_booking_confirmation.jpg");
            expect(record.id).toBeDefined();

            // Direct check before and after saving
            expect(getPlate(record.id)).toBeUndefined();

            // Save plate
            const rawName = "railway_booking_confirmation.jpg";
            // Stored in DB via createPlate or savePlate
            const { savePlate } = require("../src/db");
            savePlate(record, rawName);

            const retrieved = getPlate(record.id);
            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(record.id);
            expect(retrieved?.rawName).toBe(rawName);
            expect(retrieved?.generatedName).toBe(record.generatedName);
            expect(retrieved?.createdAt).toBeDefined();
            expect(new Date(retrieved!.createdAt).toISOString()).toBe(retrieved!.createdAt);
        });

        test("returns undefined when retrieving non-existent UUID from database", () => {
            const nonExistent = getPlate("11111111-2222-3333-4444-555555555555");
            expect(nonExistent).toBeUndefined();
        });

        test("ensures test isolation via clearPlates", () => {
            const record = createPlate("bank_statement.pdf");
            const { savePlate } = require("../src/db");
            savePlate(record, "bank_statement.pdf");

            expect(getPlate(record.id)).toBeDefined();
            clearPlates();
            expect(getPlate(record.id)).toBeUndefined();
        });

    });

    // =========================================================================
    // 9. API Validation and Error Handling
    // =========================================================================
    describe("API Validation and Error Handling", () => {

        test("returns 400 when fileName property is missing in request body", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required"
            });
        });

        test("returns 400 when fileName is an empty string", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "" });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required"
            });
        });

        test("returns 400 when fileName is whitespace only", async () => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: "     " });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required"
            });
        });

        test.each([
            ["number", 12345],
            ["boolean", true],
            ["null", null],
            ["array", ["train_ticket.pdf"]],
            ["object", { name: "train_ticket.pdf" }],
        ])("returns 400 when fileName is of non-string type: %s", async (_, invalidValue) => {
            const res = await request(app)
                .post("/api/v1/plate")
                .send({ fileName: invalidValue });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "fileName is required"
            });
        });

        test("returns 404 when GET /api/v1/plate/:id is called with unknown UUID", async () => {
            const res = await request(app)
                .get("/api/v1/plate/99999999-9999-9999-9999-999999999999");

            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: "Plate not found"
            });
        });

        test("returns 400 when GET /api/v1/plate/:id is called with arbitrary invalid UUID string", async () => {
            const res = await request(app)
                .get("/api/v1/plate/arbitrary-missing-id");

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                error: "Invalid plate id"
            });
        });

    });

});
