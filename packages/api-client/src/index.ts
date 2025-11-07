/**
 * Placeholder API client types until automatic generation via openapi-typescript-codegen is available.
 *
 * This file should be replaced by generated sources as soon as the FastAPI backend
 * can expose a reachable OpenAPI schema in the development environment.
 */

export const OpenAPI = {
  BASE: "http://localhost:8000",
  VERSION: "1.0.0",
  TOKEN: undefined as string | undefined,
};

export interface ApiRequestConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export function createApiClientPlaceholder() {
  throw new Error(
    "API client generation is pending. Execute `pnpm generate:api-client` once the backend is running to refresh this package."
  );
}
