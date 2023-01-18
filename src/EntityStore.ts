import { makeAutoObservable } from 'mobx';
import { Repository, Identifier } from './Repository';

// TODO: implement generic type for the entity
export class EntityStore {
  loading = false;
  data: unknown | null = null;
  identifier: Identifier | null = null;

  constructor(private repository: Repository) {
    makeAutoObservable<EntityStore, 'repository'>(
      this,
      { repository: false },
      { autoBind: true }
    );
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setData(data: unknown | null) {
    this.data = data;
  }

  setIdentifier(identifier: Identifier) {
    this.identifier = identifier;
  }

  async fetch() {
    if (!this.identifier) {
      return console.warn("Can't fetch without an identifier");
    }

    this.setLoading(true);

    try {
      const response = await this.repository.read(this.identifier);
      this.setData(response.data);
      this.setLoading(false);
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  // TODO: Implement update with different methods: patch and put
  async update(data: object) {
    if (!this.identifier) {
      return console.warn("Can't update without an identifier");
    }

    this.setLoading(true);

    try {
      const response = await this.repository.patch(this.identifier, data);

      if (this.data) {
        this.setData({ ...this.data, ...response.data });
      }

      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  async delete() {
    if (!this.identifier) {
      return console.warn("Can't delete without an identifier");
    }

    this.setLoading(true);

    try {
      await this.repository.delete(this.identifier);
      this.setData(null);
      this.setLoading(false);
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  reset() {
    this.identifier = null;
    this.data = null;
    this.loading = false;
  }
}
