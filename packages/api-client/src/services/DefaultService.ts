import { request, RequestOptions } from '../core/request';

export class DefaultService {
  public static async healthCheckHealthGet(options: RequestOptions = {}): Promise<unknown> {
    const data = await request<unknown>({
      method: 'GET',
      url: "/health",
      ...options,
    });
    return data;
  }
}
