import axios, { AxiosRequestConfig } from 'axios';
import { OpenAPI, getToken } from './OpenAPI';

export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method'> {}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...config.headers,
  };

  const response = await axios.request<T>({
    baseURL: OpenAPI.BASE,
    ...config,
    headers,
  });

  return response.data;
}
