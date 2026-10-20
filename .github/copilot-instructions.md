# Copilot instructions for Open Plate

- Project shape: Node + TypeScript backend in `src/`, React + Vite frontend in `frontend/`, and a SQLite-backed API with `better-sqlite3`.
- Backend entrypoint is `src/index.ts`; it creates the Express app, loads routes, serves Swagger UI under `/docs`, and only starts listening when run directly.
- API surface lives in `src/router.ts`; keep endpoint contracts stable and preserve current JSON response shapes. Do not rename or change existing routes without a matching test.
- Database access is centralized in `src/db.ts` and uses an in-memory SQLite database in tests (`NODE_ENV=test`), while production defaults to `openplate.db` unless `DB_PATH` is set.
- Frontend config is in `frontend/vite.config.ts`; the Vite server proxies `/api` to `http://localhost:3000` by default and respects `VITE_API_BASE_URL` for local overrides. Keep that proxy behavior intact.
- Frontend API calls are centralized in `frontend/src/services/api.ts` and use relative `/api` URLs when no override is provided. Do not hardcode localhost URLs into UI code.
- Preserve app behavior: do not redesign UI, change filename generation logic, replace SQLite, or weaken the Jest/Supertest test suite.
- Test command: `npm test` (Jest). Build command: `npm run build` for the backend. Frontend build: `npm run frontend:build`.
- Local dev flow: backend `npm run dev` or `npm run start` after building; frontend `npm --prefix frontend run dev -- --host 0.0.0.0`.
- For Codespaces or forwarded ports, the supported startup path is `npm run codespace` from the repo root; it starts the backend first, waits for `/health`, then launches the Vite frontend on `0.0.0.0:5173`.
- Existing tests depend on the app export from `src/index.ts`; avoid opening extra listener processes in test code.
- Keep database files out of source control; `.gitignore` already ignores `*.db`, `*.db-shm`, and `*.db-wal`.
- README is the canonical user-facing doc. Update it rather than inventing alternate setup steps.
- Prefer small, targeted edits near the relevant module; the project is compact enough that reading the route and service files together usually tells the whole story.
