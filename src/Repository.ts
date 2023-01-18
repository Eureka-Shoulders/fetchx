import { HttpService } from './HttpService';
import { RequestInitWithParams } from './types';

export type Identifier = string | number;

export interface RepositoryOptions {
  path: string;
}

export type ResponseWithData<T extends object> = Response & {
  data: T;
};

export class Repository {
  private _apiService: HttpService;
  private _options: RepositoryOptions;

  constructor(apiService: HttpService, options: RepositoryOptions) {
    this._apiService = apiService;
    this._options = options;
  }

  async create<Data extends object, T extends object>(
    data: Data
  ): Promise<ResponseWithData<T>> {
    const response = await this._apiService.fetch(this._options.path, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return { ...response, data: await response.json() };
  }

  async read<T extends object>(id?: Identifier): Promise<ResponseWithData<T>>;
  async read<T extends object>(
    params?: RequestInitWithParams
  ): Promise<ResponseWithData<T>>;
  async read<T extends object>(
    id: Identifier,
    params?: RequestInitWithParams
  ): Promise<ResponseWithData<T>>;
  async read<T extends object>(
    firstParam?: Identifier | RequestInitWithParams,
    params?: RequestInitWithParams
  ): Promise<ResponseWithData<T>> {
    if (typeof firstParam === 'object') {
      const response = await this._apiService.fetch(this._options.path, {
        ...firstParam,
        method: 'GET',
      });

      return { ...response, data: await response.json() };
    }

    const url = firstParam
      ? `${this._options.path}/${firstParam}`
      : this._options.path;
    const response = await this._apiService.fetch(url, {
      ...params,
      method: 'GET',
    });

    return { ...response, data: await response.json() };
  }

  async patch<Data extends object, T extends object>(
    id: Identifier,
    data: Data
  ): Promise<ResponseWithData<T>> {
    const response = await this._apiService.fetch(
      `${this._options.path}/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    return { ...response, data: await response.json() };
  }

  async put<Data extends object, T extends object>(
    id: Identifier,
    data: Data
  ): Promise<ResponseWithData<T>> {
    const response = await this._apiService.fetch(
      `${this._options.path}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    return { ...response, data: await response.json() };
  }

  async delete<T extends object>(id: Identifier): Promise<ResponseWithData<T>> {
    const response = await this._apiService.fetch(
      `${this._options.path}/${id}`,
      {
        method: 'DELETE',
      }
    );

    return { ...response, data: await response.json() };
  }
}
