import { makeAutoObservable } from 'mobx';
import Repository from './Repository';
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
export default class ListStore<T = unknown> {
  /**
   * @param repository The {@link Repository} to use to fetch the data.
   * @param options The {@link ListStoreOptions} to configure the store.
   */
  constructor(
    private readonly repository: Repository,
    private readonly options: ListStoreOptions
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

    try {
      this.setPaginationFilters();

      const response = await this.repository.read<
        Record<string, unknown> | unknown[]
      >({
        params: this.filters,
      });
      const responseData = response.data as Record<string, unknown>;
      let results: T[] = [];

      if (this.options.resultsField) {
        results = responseData[this.options.resultsField] as T[];
      } else {
        results = response.data as T[];
      }

      if (!Array.isArray(results)) {
        throw new Error('Invalid response. Data should be an array.');
      }

      if (this.options.infiniteScroll) {
        this.setList([...this.list, ...results]);
      } else {
        this.setList(results);
      }

      if (this.options.totalCountField) {
        if (isNaN(responseData[this.options.totalCountField] as number)) {
          throw new Error('Invalid response. Total count should be a number.');
        }

        this.setTotalCount(
          responseData[this.options.totalCountField] as number
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

  /**
   * Adds an event listener to fetch the data when the window is focused.
   */
  startFocusListener() {
    window.addEventListener('focus', this.fetch);
  }

  /**
   * Remove all event listeners and reactions registered by the store.
   */
  removeFocusListener() {
    window.removeEventListener('focus', this.fetch);
  }

  /**
   * Resets the store state.
   */
  reset() {
    this.page = 1;
    this.list = [];
    this.filters = new URLSearchParams();
    this.totalCount = 0;
    this.loading = false;
  }

  private setTotalCount(totalCount: number) {
    this.totalCount = totalCount;
  }

  private setPaginationFilters() {
    this.filters.set(
      this.options.skipField,
      `${(this.page - 1) * this.options.limit}`
    );
    this.filters.set(this.options.limitField, `${this.options.limit}`);
  }

  get limit() {
    return this.options.limit;
  }
}
