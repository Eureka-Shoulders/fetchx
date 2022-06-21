import { makeAutoObservable } from 'mobx';
import Repository, { Identifier } from './Repository';

/**
 * In contrast with the ListStore, EntityStores can only handle a single entity.
 *
 * It can be used to fetch the entity by an identifier, update the loaded entity and delete it.
 */
export default class EntityStore {
  /**
   * @param repository The {@link Repository} to use for fetch data
   */
  constructor(private repository: Repository) {
    makeAutoObservable<EntityStore, 'repository'>(
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
   * The data that represents an entity.
   */
  data: unknown | null = null;
  /**
   * The identifier of the entity.
   */
  identifier: Identifier | null = null;

  /**
   * Change the loading state of the store.
   * @param loading The loading state to set.
   */
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Change the data of the entity.
   * @param data The data that represents an entity..
   */
  setData(data: unknown | null) {
    this.data = data;
  }

  /**
   * Change the identifier of the entity.
   */
  setIdentifier(identifier: Identifier) {
    this.identifier = identifier;
  }

  /**
   * Fetch the entity by the provided identifier.
   */
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
  /**
   * A method to update the entity.
   * @param data The data to update.
   */
  async update(data: unknown) {
    if (!this.identifier) {
      return console.warn("Can't update without an identifier");
    }

    this.setLoading(true);

    try {
      const response = await this.repository.patch(this.identifier, data);
      this.setData(response.data);
      this.setLoading(false);
      return response.data;
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  /**
   * A method to delete the entity.
   */
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
