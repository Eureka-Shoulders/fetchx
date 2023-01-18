import { makeAutoObservable } from 'mobx';
import { Repository } from './Repository';

export interface ListStoreOptions {
  skipField?: string;
  limitField?: string;
  limit?: number;
  infiniteScroll?: boolean;
  refetchOnFocus?: boolean;
  resultsField?: string;
  totalCountField?: string;
  defaultParams?: Record<string, string | string[]>;
}

export class ListStore<T = unknown> {
  loading = false;
  page = 1;
  list: T[] = [];
  totalCount = 0;
  filters = new URLSearchParams();

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

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setList(list: T[]) {
    this.list = list;
  }

  async fetch() {
    this.setLoading(true);

    try {
      this.setPaginationFilters();
      this.setDefaultParams();

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

  setPage(page: number) {
    this.page = page;
  }

  startFocusListener() {
    window.addEventListener('focus', this.fetch);
  }

  removeFocusListener() {
    window.removeEventListener('focus', this.fetch);
  }

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
    if (this.options.limit !== undefined) {
      if (this.options.skipField) {
        this.filters.set(
          this.options.skipField,
          `${(this.page - 1) * this.options.limit}`
        );
      }

      if (this.options.limitField) {
        this.filters.set(this.options.limitField, `${this.options.limit}`);
      }
    }
  }

  private setDefaultParams() {
    if (this.options.defaultParams) {
      Object.entries(this.options.defaultParams).forEach(([key, value]) => {
        if (this.filters.get(key) === null) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              this.filters.append(key, item);
            });
          } else {
            this.filters.set(key, value);
          }
        }
      });
    }
  }

  get limit() {
    return this.options.limit;
  }
}
