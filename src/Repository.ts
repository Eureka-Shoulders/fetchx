import { RequestInitWithParams, HttpService } from './HttpService';

export type Identifier = string | number;

export interface RepositoryOptions {
  path: string;
}

export type ResponseWithData<T extends object> = Response & {
  data: T;
};

/**
 * Repositories will abstract the CRUD operations of your entities.
 * No state is stored in the repository, it only provides methods to fetch, create, update and delete entities.
 * It uses the {@link HttpService} to make the requests to the server.
 *
 * @example ```typescript
 * import { Repository } from '@euk-labs/fetchx';
 *
 * const usersRepository = new Repository(httpService, { path: '/users' });
 *
 * usersRepository.create({ name: 'John Doe', age: 42 });
 * ```
 */
export class Repository {
  private _apiService: HttpService;
  private _options: RepositoryOptions;

  /**
   * @param apiService A {@link HttpService} instance to use for the requests.
   * @param options Options to configure the repository.
   */
  constructor(apiService: HttpService, options: RepositoryOptions) {
    this._apiService = apiService;
    this._options = options;
  }

  /**
   * A shortcut to create a new entity.
   * @param data The data to create the entity with.
   */
  async create<Data extends object, T extends object>(
    data: Data
  ): Promise<ResponseWithData<T>> {
    const response = await this._apiService.fetch(this._options.path, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return { ...response, data: await response.json() };
  }

  /**
   * A method to fetch all entities.
   *
   * It can be called without any params to fetch all entities or with an identifier to fetch a single entity.
   * @param id The identifier of the entity to fetch.
   */
  async read<T extends object>(id?: Identifier): Promise<ResponseWithData<T>>;
  /**
   * A method to fetch all entities.
   * @param params The params to filter the entities.
   */
  async read<T extends object>(
    params?: RequestInitWithParams
  ): Promise<ResponseWithData<T>>;
  /**
   * A method to fetch all entities.
   * @param id The identifier of the entity to fetch.
   * @param params Query params to configure the request.
   */
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

  /**
   * A method for updating an entity with PATCH verb.
   * @param id The identifier of the entity to update.
   * @param data The data to update the entity with.
   */
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

  /**
   * A method for updating an entity with PUT verb.
   * @param id The identifier of the entity to update.
   * @param data The data to update the entity with.
   */
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

  /**
   * A method for deleting an entity.
   * @param id The identifier of the entity to delete.
   */
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
