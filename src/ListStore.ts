import { makeAutoObservable } from 'mobx';
import Repository from './Repository';

export interface ListStoreOptions {
  infiniteScroll?: boolean;
  limitField: string;
  limit: number;
}

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

    const response = await this.repository.read<unknown[]>({
      [this.options.limitField]: this.options.limit,
      page: this.page,
    });

    if (this.options.infiniteScroll) {
      this.setList([...this.list, ...response.data]);
    } else {
      this.setList(response.data);
    }

    this.setLoading(false);
  }

  setPage(page: number) {
    this.page = page;
  }
}
