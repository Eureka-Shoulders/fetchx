import { makeAutoObservable } from 'mobx';
import Repository from './Repository';
import { injectable } from 'inversify';
import { ListStoreOptions } from './types';

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
export default class ListStore {
  /**
   * @param repository The {@link Repository} to use to fetch the data.
   * @param options The {@link ListStoreOptions} to configure the store.
   */
  constructor(
    private repository: Repository,
    private options: ListStoreOptions
  ) {
    makeAutoObservable<ListStore, 'repository'>(
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
  list: unknown[] = [];

  /**
   * The number of total entities in the list provided by the API for pagination purposes.
   */
  totalCount = 0;

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
  setList(list: unknown[]) {
    this.list = list;
  }

  /**
   * Fetches the data from the repository.
   */
  async fetch() {
    this.setLoading(true);

    try {
      const response = await this.repository.read<Record<string, unknown>>({
        [this.options.limitField]: this.options.limit,
        skip: (this.page - 1) * this.options.limit,
      });
      const results = this.options.resultsField
        ? response.data[this.options.resultsField]
        : response.data;

      if (!Array.isArray(results)) {
        throw new Error('Invalid response. Data should be an array.');
      }

      if (this.options.infiniteScroll) {
        this.setList([...this.list, ...results]);
      } else {
        this.setList(results);
      }

      if (this.options.totalCountField) {
        if (isNaN(response.data[this.options.totalCountField] as number)) {
          throw new Error('Invalid response. Total count should be a number.');
        }

        this.setTotalCount(
          response.data[this.options.totalCountField] as number
        );
      } else {
        this.setTotalCount(this.list.length);
      }

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
