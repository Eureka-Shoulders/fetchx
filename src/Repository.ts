import { AxiosResponse } from 'axios';
import HttpService from './HttpService';

type Identifier = string | number;
interface RepositoryOptions {
  /**
   * The base url of the repository.
   * @link https://shoulders.dev/docs/api/repository#options
   */
  path: string;
}

export default class Repository {
  private _apiService: HttpService;
  private _options: RepositoryOptions;

  constructor(apiService: HttpService, options: RepositoryOptions) {
    this._apiService = apiService;
    this._options = options;
  }

  create<Data, Response>(data: Data) {
    return this._apiService.client.post<
      Response,
      AxiosResponse<Response, Data>
    >(this._options.path, data);
  }

  read<T>(id?: Identifier): Promise<AxiosResponse<T>>;
  read<T>(params?: Record<string, unknown>): Promise<AxiosResponse<T>>;
  read<T>(
    id: Identifier,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>>;
  read<T>(
    firstParam?: Identifier | Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    if (typeof firstParam === 'object') {
      return this._apiService.client.get<T>(this._options.path, {
        params: firstParam,
      });
    }

    const url = firstParam
      ? `${this._options.path}/${firstParam}`
      : this._options.path;

    return this._apiService.client.get(url, params);
  }

  patch<Data, Response>(id: Identifier, data: Data) {
    return this._apiService.client.patch<
      Response,
      AxiosResponse<Response, Data>
    >(`${this._options.path}/${id}`, data);
  }

  put<Data, Response>(id: string, data: unknown) {
    return this._apiService.client.put<Response, AxiosResponse<Response, Data>>(
      `${this._options.path}/${id}`,
      data
    );
  }

  delete<T>(id: string) {
    return this._apiService.client.delete<T>(`${this._options.path}/${id}`);
  }
}
