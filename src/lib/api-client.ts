import { DefaultService } from '../../packages/api-client/src/services/DefaultService';
import { OpenAPI, type OpenAPIConfig } from '../../packages/api-client/src/core/OpenAPI';
import { request, type RequestOptions } from '../../packages/api-client/src/core/request';

export type ApiRequestConfig = RequestOptions;

export function createApiClientPlaceholder(baseUrl?: OpenAPIConfig['BASE']) {
  if (baseUrl) {
    OpenAPI.BASE = baseUrl;
  }

  return { OpenAPI, DefaultService, request };
}

export { DefaultService, OpenAPI, request };
