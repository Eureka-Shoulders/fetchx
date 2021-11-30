import 'reflect-metadata';
import { makeAutoObservable } from 'mobx';
import Repository from './Repository';
import { injectable } from 'inversify';
import { ListStoreOptions } from './types';

@injectable()
export default class ListStore {
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

  loading = false;
  page = 1;
  list: unknown[] = [];

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setList(list: unknown[]) {
    this.list = list;
  }

  async fetch() {
    this.setLoading(true);

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

    this.setLoading(false);
  }

  setPage(page: number) {
    this.page = page;
  }
}
