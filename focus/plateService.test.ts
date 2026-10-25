import {
    createPlate,
    generateDateCode,
    generatePlateName,
} from "../src/plateService";

import { parseFileName } from "../src/nameParser";

describe("plateService", () => {

    describe("generateDateCode()", () => {

        test("generates the correct DDMMYY date code for August 11, 2026", () => {
            const date = new Date(2026, 7, 11); // August 11, 2026
            expect(generateDateCode(date)).toBe("110826");
        });

        test("generates the correct DDMMYY date code with zero-padding for January 5, 2026", () => {
            const date = new Date(2026, 0, 5); // January 5, 2026
            expect(generateDateCode(date)).toBe("050126");
        });

        test("generates the correct DDMMYY date code for October 20, 2026", () => {
            const date = new Date(2026, 9, 20); // October 20, 2026
            expect(generateDateCode(date)).toBe("201026");
        });

    });

    describe("generatePlateName()", () => {

        test("creates the expected Open Plate filename without dapa prefix and with DDMMYY date code", () => {
            const parsed = parseFileName(
                "google chrome passwords.csv"
            );

            const date = new Date(2026, 9, 20); // October 20, 2026

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "gogl_chrm_pswd_usen_201026.csv"
            );
        });

        test("uses NAKF when no extension exists", () => {
            const parsed = parseFileName("notes");

            const date = new Date(2026, 9, 20); // October 20, 2026

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "nts_usen_201026.NAKF"
            );
        });

        test("does not include any platform prefix even if environment variables exist", () => {
            process.env.PLATFORM = "demo";

            const parsed = parseFileName(
                "google chrome passwords.csv"
            );

            const date = new Date(2026, 7, 11);

            expect(
                generatePlateName(parsed, date)
            ).toBe(
                "gogl_chrm_pswd_usen_110826.csv"
            );

            delete process.env.PLATFORM;
        });

        test("preserves language segment (usen) and original extension", () => {
            const parsed = parseFileName("project report.pdf");
            const date = new Date(2026, 9, 20);
            const name = generatePlateName(parsed, date);
            expect(name).toBe("prjc_rprt_usen_201026.pdf");
            expect(name.endsWith(".pdf")).toBe(true);
            expect(name).toContain("_usen_");
            expect(name.startsWith("dapa_")).toBe(false);
        });

    });

    describe("createPlate()", () => {

        test("creates a complete Plate record without dapa prefix", () => {
            const plate = createPlate(
                "google chrome passwords.csv",
                new Date(2026, 9, 20)
            );

            expect(plate.id).toBeDefined();
            expect(typeof plate.id).toBe("string");
            expect(plate.rawName).toBe(
                "google chrome passwords.csv"
            );
            expect(plate.generatedName).toBe("gogl_chrm_pswd_usen_201026.csv");
            expect(plate.generatedName.startsWith("dapa_")).toBe(false);

            expect(plate.parsed.place).toBe("gogl");
            expect(plate.parsed.persona).toBe("chrm");
            expect(plate.parsed.purpose).toBe("pswd");
        });

    });

});