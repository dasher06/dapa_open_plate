# Open Plate

### Universal File Naming API

**Generate consistent, structured, and traceable filenames through a simple API and web interface.**

Open Plate is a developer-focused file naming platform that converts human-readable file descriptions into standardized filenames. It provides a REST API for generating and retrieving naming records, a web interface for interacting with the API, and a persistent SQLite database for storing generated records.

[Features](#features) · [Quick Start](#quick-start) · [GitHub Codespaces](#run-with-github-codespaces) · [API Reference](#api-reference) · [Testing](#testing) · [Troubleshooting](#troubleshooting)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Run Locally on Windows](#run-locally-on-windows)
- [Run Locally on macOS and Linux](#run-locally-on-macos-and-linux)
- [Run with GitHub Codespaces](#run-with-github-codespaces)
- [API Reference](#api-reference)
- [Naming Convention](#naming-convention)
- [Configuration](#configuration)
- [Testing](#testing)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)
- [Security and Data Storage](#security-and-data-storage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

File naming becomes difficult to manage when different applications, users, and workflows follow different conventions. Inconsistent filenames are harder to identify, organize, retrieve, and process programmatically.

Open Plate provides a standardized file naming workflow. Users submit a file description through the web interface or API. Open Plate generates a structured filename and stores the resulting record so it can be retrieved later by its unique identifier.

### Project Goals

- Standardize filenames using a predictable naming convention.
- Provide a reusable REST API for file naming workflows.
- Offer a web interface for generating and viewing naming results.
- Persist generated records using SQLite.
- Support automated testing and maintainable development.
- Make the project easy to run locally or in GitHub Codespaces.

## Features

### File Naming API

- Generate standardized filenames from submitted naming information.
- Return generated filenames and unique record identifiers.
- Retrieve previously stored records by identifier.
- Versioned API endpoints under `/api/v1`.

### Web Interface

- React-based interface for interacting with Open Plate.
- Form-based filename generation and file upload interface.
- Structured presentation of generated results.
- Sidebar navigation and documentation modal.
- API error handling and user feedback.

### Data Persistence

- SQLite-backed storage for naming records.
- Unique identifiers for retrieving stored records.
- Database initialization and persistence managed by the backend.

### Developer Experience

- TypeScript backend and frontend.
- Automated backend tests with Jest and Supertest.
- Frontend development and production build scripts.
- GitHub Codespaces development-container configuration.
- One-command startup through `npm run codespace`.

> **Note:** The exact filename-generation rules and upload behavior are defined by the implementation. Refer to `Blueprint.txt` and the API source for authoritative behavior.

## How It Works

1. A user submits naming information through the frontend or REST API.
2. The backend validates and processes the submitted information.
3. The naming logic generates a standardized filename.
4. The backend stores the naming record in SQLite.
5. The API returns the generated filename and its record identifier.
6. The user can retrieve the stored record using that identifier.

### High-Level Architecture

```text
┌─────────────────────────────────────┐
│            User / Client            │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│       React + TypeScript UI         │
│          Vite Development           │
└──────────────────┬──────────────────┘
                   │ HTTP / REST API
                   ▼
┌─────────────────────────────────────┐
│       Express + TypeScript API      │
│                                     │
│  Validation → Naming Logic → Routes │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             SQLite                  │
│       Persistent Naming Records     │
└─────────────────────────────────────┘
```

During development, Vite proxies API requests to the backend.

## Technology Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 22+ |
| Backend language | TypeScript |
| Backend framework | Express |
| Database | SQLite via `better-sqlite3` |
| Frontend framework | React |
| Frontend language | TypeScript |
| Frontend tooling | Vite |
| Test framework | Jest |
| API testing | Supertest |
| Development environment | GitHub Codespaces / VS Code |

## Project Structure

```text
dapa_open_plate/
├── .devcontainer/
│   └── devcontainer.json       # Codespaces configuration (Node 22 image)
├── .github/
│   └── copilot-instructions.md # Repository-specific guidance
├── focus/                      # Backend tests
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React UI components
│   │   ├── services/           # API client
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx             # Main application
│   │   ├── index.css           # Application styles
│   │   └── main.tsx            # Frontend entry point
│   ├── .env.example            # Frontend environment template
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── start-codespace.sh      # Codespaces startup script
├── src/
│   ├── db.ts                   # Database setup and access
│   ├── index.ts                # Backend entry point
│   ├── plateService.ts         # Naming service
│   └── router.ts               # API routes
├── .gitignore
├── .nvmrc                      # Node.js version (22)
├── Blueprint.txt               # Project specification
├── jest.config.ts
├── LICENSE
├── package.json                # Backend scripts and dependencies
├── package-lock.json
├── tsconfig.json
└── README.md
```

The structure highlights the principal files. Other test and configuration files may also be present. The `dist/`, `node_modules/` and `openplate.db` entries are generated at build or run time.

---

## Prerequisites

- **Node.js 22 or newer.** This is a hard requirement: `better-sqlite3` v13 declares `node >=22`, and running it on Node 20 crashes the process (see [Troubleshooting](#segmentation-fault-on-startup)).
- **npm** (included with Node.js).
- **Git**.
- A terminal or code editor. Visual Studio Code is recommended.

Check your versions:

```bash
node --version    # must print v22.x.x or newer
npm --version
git --version
```

The `.nvmrc` file pins the intended major version. If you use `nvm`, run `nvm use` in the project root.

---

## Quick Start

Clone the repository:

```bash
git clone https://github.com/dasher06/dapa_open_plate.git
cd dapa_open_plate
```

The Codespaces setup currently lives on the `docs/update-readme` branch. Until it is merged into `main`, check it out:

```bash
git checkout docs/update-readme
```

Install backend dependencies:

```bash
npm ci
```

Install frontend dependencies:

```bash
npm --prefix frontend ci
```

Let both commands finish. Do not interrupt `npm ci` with `Ctrl+C`, because that leaves `node_modules` partially installed.

---

## Run Locally on Windows

These instructions use PowerShell and Visual Studio Code.

### 1. Install Node.js 22

Install Node.js 22 and verify it:

```powershell
node --version
npm --version
```

If you use a Node version manager, switch to Node.js 22 before installing dependencies.

### 2. Clone the repository

```powershell
git clone https://github.com/dasher06/dapa_open_plate.git
cd dapa_open_plate
git checkout docs/update-readme
```

### 3. Install dependencies

```powershell
npm ci
npm --prefix frontend ci
```

### 4. Start the backend

In a terminal at the repository root:

```powershell
npm run dev
```

The API is expected at `http://localhost:3000`. Verify it at `http://localhost:3000/health`. Keep this terminal open.

### 5. Start the frontend

In a second terminal at the repository root:

```powershell
npm run frontend:dev
```

Open `http://localhost:5173`.

### Note on `npm run codespace`

The `npm run codespace` script uses Bash and is intended for the Codespaces Linux environment. On Windows, run the backend and frontend in two separate PowerShell terminals as shown above. Use WSL if you want to run the Bash script.

---

## Run Locally on macOS and Linux

### 1. Clone and install

```bash
git clone https://github.com/dasher06/dapa_open_plate.git
cd dapa_open_plate
git checkout docs/update-readme

nvm use          # optional: reads .nvmrc and switches to Node 22
npm ci
npm --prefix frontend ci
```

### 2. Start the backend

```bash
npm run dev
```

The API is available at `http://localhost:3000`.

### 3. Start the frontend

In another terminal:

```bash
npm run frontend:dev
```

Open `http://localhost:5173`.

### 4. Verify the API

```bash
curl http://localhost:3000/health
```

A successful response means the backend is running.

---

## Run with GitHub Codespaces

GitHub Codespaces provides a cloud development environment with the repository and its tools available in browser-based VS Code. No local setup is required.

The repository is public, so any GitHub account can create a Codespace on it. Usage counts against that account's own free Codespaces quota.

### How the environment is configured

- `.devcontainer/devcontainer.json` uses the image `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm`, which provides Node.js 22.
- The container runs `npm ci && npm --prefix frontend ci` automatically after creation.
- Ports `3000` (API) and `5173` (frontend) are forwarded.
- `.nvmrc` contains `22`.

### 1. Create a Codespace

1. Open **https://github.com/dasher06/dapa_open_plate**.
2. Use the branch dropdown to select the branch containing the Codespaces setup. This is `docs/update-readme` until it is merged into `main`.
3. Click **Code**.
4. Open the **Codespaces** tab.
5. Click **Create codespace on `<branch>`**.

> **Important:** The Codespace must be created from a branch that contains the Node 22 `devcontainer.json`. A Codespace created from a branch without it uses Node 20, and the backend will crash with a segmentation fault.

If the Codespaces option is missing, sign in to GitHub and check that Codespaces is available for your account.

### 2. Wait for setup to finish

The first setup can take several minutes while the container is built and dependencies are installed. Wait until the terminal prompt appears.

Confirm the Node version:

```bash
node --version
```

Expected output:

```text
v22.x.x
```

If it prints `v20.x.x`, rebuild the container: press `Ctrl+Shift+P`, run **Codespaces: Rebuild Container**, wait for it to finish, and check again.

### 3. Start the application

In the Codespaces terminal, run:

```bash
npm run codespace
```

The startup script:

1. Builds the backend TypeScript source (`tsc`).
2. Starts the backend on port `3000`.
3. Waits for the `/health` endpoint to report healthy.
4. Starts the Vite frontend on port `5173`.
5. Keeps both services running while the terminal process stays active.

Expected output:

```text
Building backend...
Starting backend on port 3000...
Backend is healthy at http://127.0.0.1:3000/health
Starting frontend...
```

### 4. Open the app

1. Open the **Ports** tab in VS Code.
2. Find port `5173`.
3. Open its forwarded address in your browser (a popup may also offer this).

The backend's forwarded address on port `3000` can be used for API access and health checks.

### 5. Stop the application

Press `Ctrl+C` in the terminal running `npm run codespace`. The script stops its child processes when it exits.

### Notes

- Creating a Codespace does not start the app automatically. Run `npm run codespace` after it opens.
- Changes to `.devcontainer/devcontainer.json` only take effect when a Codespace is created or rebuilt. Existing Codespaces keep their old image until rebuilt.

---

## API Reference

The backend exposes a versioned REST API under `/api/v1`.

### Health Check

```http
GET /health
```

Checks whether the backend is responding.

```bash
curl http://localhost:3000/health
```

In Codespaces, use the forwarded port URL when accessing the backend from outside the container.

### Generate a Naming Record

```http
POST /api/v1/plate
```

Creates a naming record and returns the generated filename and a record identifier.

The request body must follow the schema implemented by the API. See `src/router.ts`, `src/plateService.ts` and `Blueprint.txt` for the exact fields and validation rules. Illustrative request shape:

```json
{
  "filename": "google chrome passwords.csv"
}
```

A successful response includes the generated filename and a unique identifier for retrieving the record.

### Retrieve a Naming Record

```http
GET /api/v1/plate/:id
```

```bash
curl http://localhost:3000/api/v1/plate/YOUR_RECORD_ID
```

Replace `YOUR_RECORD_ID` with the identifier returned by the create endpoint.

### API Documentation

If Swagger UI is enabled in the running backend, it is available at:

```text
http://localhost:3000/docs
```

Check the backend implementation if the route differs in your version.

---

## Naming Convention

Open Plate separates a filename into meaningful components. The project specification describes the general format as:

```text
<platform>_<place>_<persona>_<purpose>[_extras...]_<language>_<date>.<ext>
```

The components are the platform, place, persona, purpose, optional extras, language, date and file extension.

Example from the project specification:

```text
google chrome passwords.csv
    ↓
dapa_gogl_chrm_pswd_usen_6811.csv
```

The exact transformation rules, abbreviations, fallback behavior and date encoding are defined by the implementation and `Blueprint.txt`. Use the naming logic and its tests as the authoritative reference.

---

## Configuration

### Backend

Key files:

- `src/index.ts` — backend entry point.
- `src/router.ts` — API routes.
- `src/db.ts` — database setup.
- `src/plateService.ts` — naming and persistence logic.
- `tsconfig.json` — TypeScript compiler configuration.

The backend listens on the port in the `PORT` environment variable. The Codespaces startup script sets it to `3000`.

### Frontend

Key files:

- `frontend/vite.config.ts` — Vite dev server and API proxy.
- `frontend/src/services/api.ts` — frontend API client.
- `frontend/.env.example` — example frontend environment configuration.

The frontend dev server uses port `5173`. To use a custom API base URL, check `frontend/.env.example` for the supported variable.

Do not put credentials or secrets in frontend environment variables. Anything exposed to the browser is public.

### Node.js Version

`.nvmrc` pins the major version:

```text
22
```

`.devcontainer/devcontainer.json` uses a matching Node 22 image. If you change the Node version, verify compatibility with native dependencies, especially `better-sqlite3`, and update both files together.

### Database

Open Plate uses SQLite through `better-sqlite3`. The database file (`openplate.db`) is runtime data created by the backend and should not be committed.

---

## Testing

Run the backend test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Build the backend:

```bash
npm run build
```

Build the frontend:

```bash
npm run frontend:build
```

Tests use Jest and Supertest and live under `focus/`. Before submitting changes, run the relevant tests and builds and check that no local database files or build output are staged.

---

## Production Build

### Backend

```bash
npm run build
```

TypeScript compiles into `dist/`. The compiled backend entry point is `dist/src/index.js`:

```bash
PORT=3000 node dist/src/index.js
```

### Frontend

```bash
npm run frontend:build
```

Vite writes production assets to `frontend/dist`.

These commands prepare build output only. They do not deploy the application. A production deployment needs a backend host, frontend hosting, persistent database storage, environment variables and appropriate security controls.

---

## Troubleshooting

### Segmentation fault on startup

**Symptom:** `npm run codespace` builds the backend, then fails with:

```text
Segmentation fault (core dumped)
Backend exited before becoming healthy.
```

and the backend log is empty.

**Cause:** the environment is running Node.js 20 (or older), but `better-sqlite3` requires Node.js 22 or newer. The native module crashes the process while loading, before the app prints anything. During `npm ci` you will see a warning like:

```text
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'better-sqlite3@13.0.3',
npm warn EBADENGINE   required: { node: '>=22' },
npm warn EBADENGINE   current: { node: 'v20.19.2', npm: '10.8.2' }
npm warn EBADENGINE }
```

**Fix:**

```bash
nvm install 22
nvm use 22
node --version          # confirm v22.x.x
rm -rf node_modules dist
npm ci                  # let it finish
npm run codespace
```

If `nvm` is not available, install Node 22 with another version manager such as `fnm`.

**Permanent fix for Codespaces:** create the Codespace from a branch that contains the Node 22 `.devcontainer/devcontainer.json`, or rebuild an existing one with **Codespaces: Rebuild Container** (`Ctrl+Shift+P`).

### `sh: 1: tsc: not found`

**Cause:** `node_modules` is incomplete, usually because `npm ci` was interrupted.

**Fix:**

```bash
rm -rf node_modules dist
npm ci
```

Wait for it to complete. Also run `npm --prefix frontend ci` if the frontend dependencies are missing.

### A new Codespace still uses Node 20

The Codespace was created from a branch without the updated `devcontainer.json`, or it was created before the change was pushed. Delete it and create a new one from the correct branch, or run **Codespaces: Rebuild Container**.

### `Cannot find module .../dist/index.js`

The compiled entry point is `dist/src/index.js`, not `dist/index.js`. Run the build and confirm:

```bash
npm run build
find dist -maxdepth 3 -type f -name 'index.js'
```

The startup script must reference the entry point the build actually generates.

### Backend health check fails

Check the backend log and that the API is listening on port `3000`:

```bash
curl -i http://127.0.0.1:3000/health
```

If the backend exits, read its log before restarting.

### Frontend cannot reach the API

Check that:

- The backend is running on port `3000`.
- The frontend dev server is running on port `5173`.
- The Vite proxy configuration points at the correct backend URL.
- The frontend API client uses the expected base URL.

### `npm ci` fails

Confirm the active Node.js version is 22 or newer and that both `package-lock.json` files are present. Run the backend and frontend installs separately to see which one fails.

### Codespaces option is missing

Sign in to GitHub, open the repository and select **Code → Codespaces**. If the option is unavailable, check your account's Codespaces access and quota.

---

## Security and Data Storage

- Do not commit `.env` files containing private configuration or credentials.
- Do not commit local SQLite database files.
- Keep dependency lockfiles under version control.
- Review changes before committing or pushing.
- Treat frontend environment variables as public.
- Add authentication, authorization, input validation and deployment controls before exposing the API to untrusted users.

Open Plate is a development project. Production use should include a security review, monitoring and a database backup strategy.

## Contributing

1. Fork the repository or create a development branch.
2. Make a focused change.
3. Install dependencies.
4. Run the relevant tests and builds.
5. Review your changes for secrets and generated files.
6. Commit and open a pull request.

```bash
git checkout -b feature/your-change
npm ci
npm --prefix frontend ci
npm test
npm run build
npm run frontend:build
```


---

**Open Plate - consistent filenames, a reusable API, and a streamlined developer workflow.**
