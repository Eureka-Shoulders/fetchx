import { EntityStore } from '../src/EntityStore';
import mockServer from './fixtures/server';
import usersRepository from './fixtures/usersRepository';
import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/dom';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const INITIAL_USERS = 1;
const server = mockServer();

describe('EntityStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    const userStore = new EntityStore(usersRepository);

    expect(userStore).toBeTruthy();
  });

  it('should warn when fetching without identifier', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const userStore = new EntityStore(usersRepository);

    userStore.fetch();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should fetch data and update store', async () => {
    const userStore = new EntityStore(usersRepository);

    userStore.setIdentifier('1');
    userStore.fetch();

    expect(userStore.loading).toBeTruthy();

    await waitFor(() => {
      expect(userStore.data).toBeTruthy();
    });
  });

  it('should warn when updating without identifier', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const userStore = new EntityStore(usersRepository);

    userStore.update({ name: 'John' });

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should update entity mutating the store', async () => {
    const userStore = new EntityStore(usersRepository);

    userStore.setIdentifier('1');
    userStore.fetch();

    await waitFor(() => {
      expect(userStore.data).toBeTruthy();
    });

    const user = (userStore.data as any).user;
    user.name = 'John Doe';

    userStore.update(user);

    expect(userStore.loading).toBeTruthy();

    await waitFor(() => {
      expect(userStore.data).toBeTruthy();
      expect((userStore.data as any).user).toEqual(user);
    });
  });

  it('should warn when deleting without identifier', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const userStore = new EntityStore(usersRepository);

    userStore.delete();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should reset store when deleting entity', async () => {
    const userStore = new EntityStore(usersRepository);

    userStore.setIdentifier('1');
    userStore.fetch();

    await waitFor(() => {
      expect(userStore.data).toBeTruthy();
    });

    userStore.delete();

    expect(userStore.loading).toBeTruthy();

    await waitFor(() => {
      expect(userStore.data).toBeFalsy();
    });
  });
});
