import { makeAutoObservable } from 'mobx';
import Repository from './Repository';
import { injectable } from 'inversify';
import { ListStoreOptions } from './types';
import cacheStore from './CacheStore';
import { AxiosResponse } from 'axios';

/**
 * `ListStore`s are a set of states and actions built with [MobX](https://mobx.js.org/react-integration.html) to handle a list of entities with resources like pagination, filters and inifinite scroll strategies.
 * They need a repository to work and know how to fetch the data.
 *
 * Please read the MobX documentation to know more about the different ways to make your components reactive.
 *
 * @example ```typescript
 * import { ListStore } from '@euk-labs/fetchx';
 *
 * const usersList = new ListStore(UserRepository, { limit: 10, limtField: 'limit' });
 *
 * await usersList.fetch();
 * console.log(usersList.list)
 * ```
 */
@injectable()
export default class ListStore<T = unknown> {
  /**
   * @param repository The {@link Repository} to use to fetch the data.
   * @param options The {@link ListStoreOptions} to configure the store.
   */
  constructor(
    private repository: Repository,
    private options: ListStoreOptions
  ) {
    makeAutoObservable<ListStore<T>, 'repository'>(
      this,
      { repository: false },
      { autoBind: true }
    );
  }

  /**
   * The loading state of the store. If it's true, the store is fetching data.
   */
  loading = false;
  /**
   * The current page of the store based on the `limit` and `skip` parameters.
   */
  page = 1;
  /**
   * The list of entities.
   * It can be incremented with the `infiniteScroll` option.
   */
  list: T[] = [];

  /**
   * The number of total entities in the list provided by the API for pagination purposes.
   */
  totalCount = 0;

  /**
   * The filters to apply to the request.
   */
  filters = new URLSearchParams();

  private setDefaultFilters() {
    this.filters.set(
      this.options.skipField,
      `${(this.page - 1) * this.options.limit}`
    );
    this.filters.set(this.options.limitField, `${this.options.limit}`);
  }

  /**
   * Change the loading state of the store.
   * @param loading The loading state to set.
   */
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Change the list of entities.
   * @param list The list of entities to set.
   */
  setList(list: T[]) {
    this.list = list;
  }

  /**
   * Fetches the data from the repository.
   */
  async fetch() {
    this.setLoading(true);

    const fetchData = () =>
      this.repository.read<Record<string, unknown> | unknown[]>({
        params: this.filters,
      });

    try {
      let results: T[] = [];
      let totalCount = 0;
      let response: AxiosResponse<Record<string, unknown> | unknown[], unknown>;

      this.setDefaultFilters();

      const filtersHash = this.filters.toString();

      if (this.options.cacheId) {
        const cachedData = cacheStore.get(
          this.options.cacheId,
          filtersHash
        ) as AxiosResponse<Record<string, unknown> | unknown[], unknown>;

        response = cachedData ? cachedData : await fetchData();
      } else {
        response = await fetchData();
      }

      if (this.options.cacheId) {
        cacheStore.set(this.options.cacheId, response, {
          hash: filtersHash,
          duration: this.options.cacheDuration,
        });
      }

      if (Array.isArray(response.data)) {
        results = response.data as T[];
      } else {
        if (this.options.resultsField) {
          results = response.data[this.options.resultsField] as T[];
        } else {
          results = response.data.data as T[];
        }

        if (this.options.totalCountField) {
          if (isNaN(response.data[this.options.totalCountField] as number)) {
            throw new Error(
              'Invalid response. Total count should be a number.'
            );
          }

          totalCount = response.data[this.options.totalCountField] as number;
        } else {
          totalCount = this.list.length;
        }
      }

      if (!Array.isArray(results)) {
        throw new Error('Invalid response. Data should be an array.');
      }

      if (this.options.infiniteScroll) {
        results = [...this.list, ...results];
      }

      this.setList(results);
      this.setTotalCount(totalCount);
      this.setLoading(false);
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  /**
   * Change the current page of the store.
   * @param page The page to fetch.
   */
  setPage(page: number) {
    this.page = page;
  }

  private setTotalCount(totalCount: number) {
    this.totalCount = totalCount;
  }

  get limit() {
    return this.options.limit;
  }
}
