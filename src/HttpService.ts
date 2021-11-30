import 'reflect-metadata';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { injectable } from 'inversify';

/**
 * The `HttpService` is a class that will work as a wrapper for [axios](https://github.com/axios/axios). It will handle all the requests and provide helpers to make your life easier.
 * @example ```typescript
 * import { HttpService } from '@euk-labs/fetchx';
 *
 * const http = new HttpService({ baseURL: 'http://localhost:3000' });
 *
 * http.get('/users').then(response => {
 *  console.log(response.data);
 * });
 * ```
 */
@injectable()
class HttpService {
  private _client: AxiosInstance;
  private _interceptors = {
    request: new Map<string, number>(),
    response: new Map<string, number>(),
  };

  /**
   *
   * @param axiosConfig Axios instance configuration. See https://github.com/axios/axios#request-config
   */
  constructor(axiosConfig: AxiosRequestConfig) {
    this._client = axios.create(axiosConfig);
  }

  /**
   * Set a new header or change it's value for all requests via header key and value.
   * @example ```typescript
   * import { HttpService } from '@euk-labs/fetchx';
   *
   * const http = new HttpService({ baseURL: 'http://localhost:3000' });
   *
   * http.setHeader('Authorization', 'Bearer 12345');
   * ```
   */
  setHeader(header: string, value: string) {
    this._client.defaults.headers.common[header] = value;
  }

  /**
   *
   * @param id Used to identify the interceptor and remove it later.
   * @param onFulfilled Function to be called when a request is successful.
   * @param onRejected Function to be called when a request fails.
   * @returns The interceptor id.
   */
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

  /**
   *
   * @param id Used to identify the interceptor and remove it later.
   * @param onFulfilled Function to be called when a request is successful.
   * @param onRejected Function to be called when a request fails.
   * @typeParam T The type of the response.
   * @returns The interceptor id.
   */
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

  /**
   *
   * @param id The identifier of the interceptor to be removed.
   * @param type The type of interceptor to be removed.
   */
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

  /**
   * An axios instance that can be used to make requests.
   */
  get client() {
    return this._client;
  }
}

export default HttpService;
