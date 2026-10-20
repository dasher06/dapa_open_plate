import { randomUUID } from "crypto";
import { ParsedFileName, parseFileName } from "./nameParser";

/**
 * Represents a generated Open Plate record.
 */
export interface PlateRecord {
    id: string;
    rawName: string;
    generatedName: string;
    parsed: ParsedFileName;
}

/**
 * Default language identifier.
 */
const DEFAULT_LANGUAGE = "usen";


/**
 * Generate the Open Plate date code.
 *
 * Format: DDMMYY
 *  - DD: Day of month (01-31)
 *  - MM: Month (01-12)
 *  - YY: Last 2 digits of the year
 *
 * Example:
 *  2026-10-20 -> 201026
 *  2026-08-11 -> 110826
 */
export function generateDateCode(date: Date = new Date()): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    return `${day}${month}${year}`;
}

/**
 * Assemble the final standardized filename.
 *
 * Format: <place>_<persona>[_<purpose>][_extras...]_<language>_<date>.<extension>
 * Note: Platform prefix (dapa) has been removed.
 */
export function generatePlateName(
    parsed: ParsedFileName,
    date: Date = new Date()
): string {
    const parts: string[] = [
        parsed.place,
        parsed.persona,
        parsed.purpose,
        ...parsed.extras,
        DEFAULT_LANGUAGE,
        generateDateCode(date)
    ].filter(Boolean);

    const extension =
        parsed.extension.trim().length > 0
            ? parsed.extension
            : "NAKF";

    return `${parts.join("_")}.${extension}`;
}

/**
 * Complete Open Plate workflow.
 *
 * Raw filename
 * ↓
 * Parse
 * ↓
 * Generate standardized filename
 * ↓
 * Generate UUID
 * ↓
 * Return record
 */
export function createPlate(
    rawFileName: string,
    date: Date = new Date()
): PlateRecord {

    const parsed = parseFileName(rawFileName);

    const generatedName =
        generatePlateName(parsed, date);

    return {

        id: randomUUID(),

        rawName: rawFileName,

        generatedName,

        parsed

    };
}