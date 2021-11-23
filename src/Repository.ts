import HttpService from "./HttpService";

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

  create(data: any) {
    return this._apiService.client.post(this._options.path, data);
  }

  read(id?: Identifier) {
    const url = id ? `${this._options.path}/${id}` : this._options.path;

    return this._apiService.client.get(url);
  }

  update(id: string, data: any) {
    return this._apiService.client.put(`${this._options.path}/${id}`, data);
  }

  delete(id: string) {
    return this._apiService.client.delete(`${this._options.path}/${id}`);
  }
}
