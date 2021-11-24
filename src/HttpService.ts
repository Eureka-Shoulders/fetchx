import 'reflect-metadata';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { injectable } from 'inversify';

@injectable()
class HttpService {
  private _client: AxiosInstance;
  private _interceptors = {
    request: new Map<string, number>(),
    response: new Map<string, number>(),
  };

  constructor(axiosConfig: AxiosRequestConfig) {
    this._client = axios.create(axiosConfig);
  }

  setHeader(header: string, value: string) {
    this._client.defaults.headers.common[header] = value;
  }

  setRequestInterceptor<T>(
    id: string,
    onFulfilled?: (value: AxiosRequestConfig) => T | Promise<T>,
    onRejected?: (error: unknown) => unknown
  ): number {
    const interceptor = this._client.interceptors.request.use(
      onFulfilled,
      onRejected
    );

    this._interceptors.request.set(id, interceptor);

    return interceptor;
  }

  setResponseInterceptor<T>(
    id: string,
    onFulfilled?: (value: AxiosResponse) => T | Promise<T>,
    onRejected?: (error: unknown) => unknown
  ): number {
    const interceptor = this._client.interceptors.response.use(
      onFulfilled,
      onRejected
    );

    this._interceptors.response.set(id, interceptor);

    return interceptor;
  }

  ejectInterceptor(id: string, type: 'request' | 'response') {
    let interceptor;

    if (type === 'request') {
      interceptor = this._interceptors.request.get(id);
      if (interceptor !== undefined) {
        this._client.interceptors.request.eject(interceptor);
      }
    } else if (type === 'response') {
      interceptor = this._interceptors.response.get(id);
      if (interceptor !== undefined) {
        this._client.interceptors.response.eject(interceptor);
      }
    }
  }

  get client() {
    return this._client;
  }
}

export default HttpService;
