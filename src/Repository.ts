import { AxiosResponse } from 'axios';
import HttpService from './HttpService';
import { injectable, unmanaged } from 'inversify';
import { Identifier, RepositoryOptions } from './types';

/**
 * Repositories will abstract the CRUD operations of your entities.
 * No state is stored in the repository, it only provides methods to fetch, create, update and delete entities.
 * It uses the {@link HttpService} to make the requests to the server.
 *
 * @example ```typescript
 * import { Repository } from '@euk-labs/fetchx';
 *
 * const usersRepository = new Repository({ path: '/users' });
 *
 * usersRepository.create({ name: 'John Doe', age: 42 });
 * ```
 */
@injectable()
export default class Repository {
  private _apiService: HttpService;
  private _options: RepositoryOptions;

  /**
   * @param apiService A {@link HttpService} instance to use for the requests.
   * @param options Options to configure the repository.
   */
  constructor(
    @unmanaged() apiService: HttpService,
    @unmanaged() options: RepositoryOptions
  ) {
    this._apiService = apiService;
    this._options = options;
  }

  /**
   * A shortcut to create a new entity.
   * @param data The data to create the entity with.
   */
  create<Data, Response>(data: Data) {
    return this._apiService.client.post<
      Response,
      AxiosResponse<Response, Data>
    >(this._options.path, data);
  }

  /**
   * A method to fetch all entities.
   *
   * It can be called without any params to fetch all entities or with an identifier to fetch a single entity.
   * @param id The identifier of the entity to fetch.
   */
  read<T>(id?: Identifier): Promise<AxiosResponse<T>>;
  /**
   * A method to fetch all entities.
   * @param params The params to filter the entities.
   */
  read<T>(params?: Record<string, unknown>): Promise<AxiosResponse<T>>;
  /**
   * A method to fetch all entities.
   * @param id The identifier of the entity to fetch.
   * @param params Query params to configure the request.
   */
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

  /**
   * A method for updating an entity with PATCH verb.
   * @param id The identifier of the entity to update.
   * @param data The data to update the entity with.
   */
  patch<Data, Response>(id: Identifier, data: Data) {
    return this._apiService.client.patch<
      Response,
      AxiosResponse<Response, Data>
    >(`${this._options.path}/${id}`, data);
  }

  /**
   * A method for updating an entity with PUT verb.
   * @param id The identifier of the entity to update.
   * @param data The data to update the entity with.
   */
  put<Data, Response>(id: Identifier, data: unknown) {
    return this._apiService.client.put<Response, AxiosResponse<Response, Data>>(
      `${this._options.path}/${id}`,
      data
    );
  }

  /**
   * A method for deleting an entity.
   * @param id The identifier of the entity to delete.
   */
  delete<T>(id: Identifier) {
    return this._apiService.client.delete<T>(`${this._options.path}/${id}`);
  }
}
