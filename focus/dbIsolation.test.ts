import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("database test isolation", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDbPath = process.env.DB_PATH;

  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "openplate-db-test-")
  );
  const productionDbPath = path.join(tempDir, "production.db");

  afterAll(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalDbPath === undefined) {
      delete process.env.DB_PATH;
    } else {
      process.env.DB_PATH = originalDbPath;
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("does not create or use DB_PATH when NODE_ENV is test", () => {
    process.env.NODE_ENV = "test";
    process.env.DB_PATH = productionDbPath;

    // The database module must be imported after setting the environment.
    jest.resetModules();

    require("../src/db");

    expect(fs.existsSync(productionDbPath)).toBe(false);
  });
});
