export interface OpenAPIConfig {
  BASE: string;
  VERSION: string;
  TOKEN?: string | (() => string | undefined);
}

export const OpenAPI: OpenAPIConfig = {
  BASE: "http://localhost:8000",
  VERSION: "1.0.0",
};

export function getToken() {
  return typeof OpenAPI.TOKEN === 'function' ? OpenAPI.TOKEN() : OpenAPI.TOKEN;
}
