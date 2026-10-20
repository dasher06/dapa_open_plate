#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKEND_LOG="${BACKEND_LOG:-/tmp/openplate-backend.log}"
FRONTEND_LOG="${FRONTEND_LOG:-/tmp/openplate-frontend.log}"
BACKEND_TIMEOUT_SECONDS="${BACKEND_TIMEOUT_SECONDS:-60}"
BACKEND_HEALTH_URL="http://127.0.0.1:3000/health"

cleanup() {
  local exit_code=$?

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Stopping frontend..."
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Stopping backend..."
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi

  exit "$exit_code"
}

trap cleanup EXIT INT TERM

echo "Building backend..."
npm run build

echo "Starting backend on port 3000..."
PORT=3000 node dist/src/index.js >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

backend_healthy=0
started_at=$SECONDS
while (( SECONDS - started_at < BACKEND_TIMEOUT_SECONDS )); do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend exited before becoming healthy."
    echo "--- backend log ---"
    cat "$BACKEND_LOG"
    exit 1
  fi

  if curl -fsS "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
    backend_healthy=1
    break
  fi

  sleep 1
done

if [[ "$backend_healthy" -ne 1 ]]; then
  echo "Backend did not become healthy within ${BACKEND_TIMEOUT_SECONDS}s."
  echo "--- backend log ---"
  cat "$BACKEND_LOG"
  exit 1
fi

echo "Backend is healthy at $BACKEND_HEALTH_URL"

echo "Starting frontend..."
npm --prefix frontend run dev -- --host 0.0.0.0 >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

echo "Open Plate is running. Frontend: http://localhost:5173"
wait "$FRONTEND_PID"
