import {
  CreatePlateResponse,
  StoredPlateResponse,
  ApiErrorResponse,
} from "../types/plate";

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
// Strip trailing slash if present
const API_BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/+$/, "") : "";

export class ApiError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Helper to execute fetch requests with consistent error handling and timeout.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. The server took too long to respond.");
    }
    if (err instanceof TypeError) {
      throw new ApiError(
        "Unable to reach the Open Plate API. Please ensure the backend server is running."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Submit a raw filename to generate and persist an Open Plate standardized name.
 */
export async function createPlate(fileName: string): Promise<CreatePlateResponse> {
  const url = `${API_BASE_URL}/api/v1/plate`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ fileName }),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (isJson) {
      try {
        const errorBody = (await response.json()) as ApiErrorResponse;
        if (errorBody && typeof errorBody.error === "string") {
          errorMessage = errorBody.error;
        }
      } catch {
        // Fallback to default message
      }
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (!isJson) {
    throw new ApiError("Invalid response received from server (expected JSON).");
  }

  const data = (await response.json()) as CreatePlateResponse;

  if (!data || typeof data.id !== "string" || typeof data.generatedName !== "string") {
    throw new ApiError("Malformed response payload from Open Plate service.");
  }

  return data;
}

/**
 * Retrieve a previously stored Open Plate record by its UUID.
 */
export async function getPlate(id: string): Promise<StoredPlateResponse> {
  const url = `${API_BASE_URL}/api/v1/plate/${encodeURIComponent(id)}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let errorMessage = `Failed to retrieve plate (${response.status})`;
    if (isJson) {
      try {
        const errorBody = (await response.json()) as ApiErrorResponse;
        if (errorBody && typeof errorBody.error === "string") {
          errorMessage = errorBody.error;
        }
      } catch {
        // Fallback
      }
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (!isJson) {
    throw new ApiError("Invalid response format received from server.");
  }

  const data = (await response.json()) as StoredPlateResponse;

  if (
    !data ||
    typeof data.id !== "string" ||
    typeof data.rawName !== "string" ||
    typeof data.generatedName !== "string"
  ) {
    throw new ApiError("Malformed record data returned by server.");
  }

  return data;
}
