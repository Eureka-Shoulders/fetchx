import { makeAutoObservable } from 'mobx';
import Repository from './Repository';

export default class ListStore {
  constructor(private repository: Repository) {
    makeAutoObservable<ListStore, 'repository'>(
      this,
      { repository: false },
      { autoBind: true }
    );
  }

  loading = false;
  list: unknown[] = [];

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  async fetch() {
    this.setLoading(true);

    const response = await this.repository.read();
    this.list = response.data;

    this.setLoading(false);
  }
}
