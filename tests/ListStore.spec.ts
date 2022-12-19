import { ListStore } from '../src/ListStore';
import mockServer from './fixtures/server';
import usersRepository from './fixtures/usersRepository';
import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const INITIAL_USERS = 15;
const server = mockServer();

describe('ListStore', () => {
  beforeAll(() => {
    for (let index = 0; index < INITIAL_USERS; index++) {
      (server as any).create('user', {
        name: faker.name.fullName(),
        email: faker.internet.email(),
      });
    }
  });

  afterAll(() => {
    server.shutdown();
  });

  it('should be created', () => {
    const usersListStore = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      skipField: 'skip',
    });

    expect(usersListStore).toBeTruthy();
    expect(usersListStore.limit).toBe(10);
  });

  it('should fetch first 10 users with limit field and results field', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      resultsField: 'users',
      skipField: 'skip',
    });

    await store.fetch();

    expect(store.list.length).toEqual(10);
  });

  it('should fetch last 5 users with limit field and results field', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      resultsField: 'users',
      skipField: 'skip',
    });

    store.setPage(2);
    await store.fetch();

    expect(store.list.length).toEqual(5);
  });

  it('should increment list on change page', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      resultsField: 'users',
      infiniteScroll: true,
      skipField: 'skip',
    });

    await store.fetch();
    store.setPage(2);
    await store.fetch();

    expect(store.list.length).toEqual(INITIAL_USERS);
  });

  it('should fetch and read all the data object throwing an error', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      skipField: 'skip',
    });

    await expect(store.fetch()).rejects.toThrow();
  });

  it('should fetch and read totalCount field', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      totalCountField: 'totalCount',
      resultsField: 'users',
      skipField: 'skip',
    });

    await store.fetch();

    expect(store.totalCount).toBe(INITIAL_USERS);
  });

  it('should fetch and throw error for invalid totalCount field', async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
      totalCountField: 'usersCount',
      resultsField: 'users',
      skipField: 'skip',
    });

    await expect(store.fetch()).rejects.toThrow();
  });

  it('should fetch with default params', async () => {
    const store = new ListStore(usersRepository, {
      resultsField: 'users',
      defaultParams: {
        test: 'test',
        array: ['test-1', 'test-2'],
      },
    });

    await store.fetch();

    expect(store.filters.get('test')).toBe('test');
    expect(store.filters.getAll('array')).toEqual(['test-1', 'test-2']);

    store.filters.set('test', 'another-test');

    expect(store.filters.get('test')).toBe('another-test');
  });
});
