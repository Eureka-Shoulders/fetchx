import 'reflect-metadata';
import { makeAutoObservable } from 'mobx';
import Repository from './Repository';
import { injectable } from 'inversify';
import { Identifier } from './types';

@injectable()
export default class EntityStore {
  constructor(private repository: Repository) {
    makeAutoObservable<EntityStore, 'repository'>(
      this,
      { repository: false },
      { autoBind: true }
    );
  }

  loading = false;
  data: unknown | null = null;
  identifier: Identifier | null = null;

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
    } finally {
      this.setLoading(false);
    }
  }

  async update(data: unknown) {
    if (!this.identifier) {
      return console.warn("Can't update without an identifier");
    }

    this.setLoading(true);

    try {
      const response = await this.repository.patch(this.identifier, data);
      this.setData(response.data);
      return response.data;
    } finally {
      this.setLoading(false);
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
    } finally {
      this.setLoading(false);
    }
  }
}
