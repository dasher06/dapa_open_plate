# Open Plate

**Universal File Naming API**

Open Plate is an open-source REST API that converts raw filenames into standardized, machine-readable names. It provides a consistent naming format that makes files easier to identify, organize, and manage across applications and platforms.

## Overview

File names created across different applications often follow inconsistent naming conventions. Open Plate addresses this problem by providing a standardized filename generation system through a REST API.

For example:

```text
Input:
google chrome passwords.csv

Output:
dapa_gogl_chrm_pswd_usen_6811.csv
```

The API generates a standardized filename, stores the associated record in a SQLite database, and returns a unique identifier that can be used to retrieve the record later.

## Features

- **Universal filename parsing** — Processes raw filenames using rule-based parsing.
- **Standardized naming** — Generates structured, machine-readable filenames.
- **Platform configuration** — Supports platform configuration through the `PLATFORM` environment variable.
- **Extension handling** — Preserves the original file extension and uses `NAKF` when no extension is provided.
- **Persistent storage** — Stores generated filename records in SQLite.
- **UUID-based retrieval** — Assigns a unique identifier to each stored record.
- **REST API** — Provides endpoints for generating and retrieving filenames.
- **Swagger UI** — Offers interactive API documentation through OpenAPI 3.0.
- **Automated testing** — Uses Jest and Supertest to test the parser, service, and API routes.

## Filename Format

Open Plate follows this naming structure:

```text
<platform>_<place>_<persona>_<purpose>[_extras...]_<language>_<date>.<extension>
```

| Component | Description | Example |
|---|---|---|
| `platform` | Identifies the configured platform | `dapa` |
| `place` | Encoded place or application-related term | `gogl` |
| `persona` | Encoded persona-related term | `chrm` |
| `purpose` | Encoded purpose-related term | `pswd` |
| `extras` | Optional additional codes | Depends on input |
| `language` | Language code | `usen` |
| `date` | Generated date code | `6811` |
| `extension` | Original file extension | `csv` |

**Example:**

```text
dapa_gogl_chrm_pswd_usen_6811.csv
```

The parser tokenizes the filename, applies configured word mappings and stop-word rules, and generates codes according to the project's naming rules.

The exact output depends on the input, parser rules, configuration, and date.

## Technology Stack

| Technology | Purpose |
|---|---|
| TypeScript | Application development with static typing |
| Node.js | JavaScript runtime |
| Express.js | HTTP server and REST API routing |
| SQLite | Persistent storage |
| better-sqlite3 | SQLite database integration |
| Swagger UI Express | Interactive API documentation |
| OpenAPI 3.0 | API specification |
| Jest | Automated testing |
| Supertest | HTTP endpoint testing |
| ts-node | Running TypeScript during development |

## Project Structure

```text
Open-Plate/
├── src/
│   ├── index.ts
│   ├── nameParser.ts
│   ├── plateService.ts
│   ├── db.ts
│   ├── router.ts
│   └── swagger.ts
├── focus/
│   ├── nameParser.test.ts
│   ├── plateService.test.ts
│   └── router.test.ts
├── jest.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
├── LICENSE
└── README.md
```

### Main Components

| File | Responsibility |
|---|---|
| `index.ts` | Initializes Express, configures middleware, registers API routes and Swagger UI, and starts the server. |
| `nameParser.ts` | Parses raw filenames and converts filename components into standardized codes. |
| `plateService.ts` | Generates standardized filenames and coordinates the filename-generation workflow. |
| `db.ts` | Handles SQLite database operations. |
| `router.ts` | Defines the API endpoints for creating and retrieving plate records. |
| `swagger.ts` | Defines the OpenAPI specification used by Swagger UI. |
| `nameParser.test.ts` | Tests filename parsing behavior. |
| `plateService.test.ts` | Tests filename generation and related service behavior. |
| `router.test.ts` | Tests API routes and HTTP responses. |

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/dataparts/dapa_open_plate.git
cd dapa_open_plate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the platform (optional)

Open Plate supports platform configuration through the `PLATFORM` environment variable.

For PowerShell:

```powershell
$env:PLATFORM="dapa"
```

If the variable is not set, the application uses the default platform defined in its implementation.

### 4. Start the development server

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

### 5. Open Swagger documentation

Visit:

http://localhost:3000/docs/

Swagger UI allows you to inspect endpoints, submit requests, and view responses directly from your browser.

## API Reference

Base URL:

```text
http://localhost:3000
```

### 1. Generate a Standardized Filename

**Endpoint:** `POST /api/v1/plate`

Generates a standardized filename, stores the record, and returns its unique ID and generated name.

**Request body**

Content-Type: `application/json`

```json
{
  "fileName": "google chrome passwords.csv"
}
```

**Successful response — HTTP 201 Created**

```json
{
  "id": "6f5949b8-8801-44f6-8552-56c45cc551e5",
  "generatedName": "dapa_gogl_chrm_pswd_usen_26823.csv"
}
```

The generated name and ID above illustrate the response structure; the actual values depend on the input and execution date.

**Possible error — HTTP 400 Bad Request**

Returned when `fileName` is missing, is not a string, or contains only whitespace.

```json
{
  "error": "fileName is required"
}
```

### 2. Retrieve a Stored Filename Record

**Endpoint:** `GET /api/v1/plate/:id`

Retrieves a previously stored record using the UUID returned by the creation endpoint.

**Example request**

```http
GET /api/v1/plate/6f5949b8-8801-44f6-8552-56c45cc551e5
```

**Successful response — HTTP 200 OK**

```json
{
  "id": "6f5949b8-8801-44f6-8552-56c45cc551e5",
  "rawName": "google chrome passwords.csv",
  "generatedName": "dapa_gogl_chrm_pswd_usen_26823.csv",
  "createdAt": "2026-08-23T08:17:27.258Z"
}
```

**Possible error responses**

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid plate ID. |
| `404 Not Found` | No stored plate record exists for the supplied ID. |

The API's current error messages and response structures are defined by its route implementation.

## Testing

Open Plate uses Jest and Supertest for automated testing.

### Run the test suite

```bash
npm test
```

### Run TypeScript compilation checks

```bash
npx tsc
```

The initial implementation was verified with:

- 3 passing test suites
- 16 passing tests
- Successful TypeScript compilation

These results describe the verified initial implementation; rerun the commands after making changes to confirm the current state.

## Development Workflow

Open Plate follows a modular architecture:

```text
Raw Filename
     |
     v
Filename Parser
     |
     v
Plate Service
     |
     v
SQLite Database
     |
     v
REST API Response
```

The API documentation is provided separately through Swagger UI.

This separation keeps parsing rules, filename generation, database operations, HTTP routing, and API documentation organized into distinct modules.

## Contributing

Contributions are welcome.

For changes to the DataParts repository:

1. Check the existing project guidelines and open issues.
2. Start from the latest `dev` branch.
3. Create a separate feature branch for your changes.
4. Implement the feature and add appropriate tests.
5. Run TypeScript compilation and the automated test suite.
6. Push your branch and open a pull request targeting `dev`.
7. Address review feedback before merging.

Example:

```bash
git switch dev
git pull origin dev
git switch -c feat/your-feature
```

After implementing and testing your changes:

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin feat/your-feature
```

Then open a pull request on GitHub.

Repository: https://github.com/dataparts/dapa_open_plate

## License

Open Plate includes an MIT license.

## Project Status

The initial implementation provides filename parsing, standardized filename generation, SQLite persistence, UUID-based record retrieval, REST API endpoints, Swagger documentation, and automated tests.

Future improvements may include stronger input validation, consistent error handling, expanded API functionality, continuous integration, and additional production-readiness features.

---

**Open Plate — Universal File Naming API**

Built to make filenames more consistent, structured, and machine-readable.