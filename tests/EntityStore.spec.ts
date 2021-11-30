import { EntityStore } from '../src';
import mockServer from './fixtures/server';
import usersRepository from './fixtures/usersRepository';
import faker from 'faker';
import { waitFor } from '@testing-library/dom';

const INITIAL_USERS = 1;
const server = mockServer();

describe('EntityStore', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    if (consoleSpy) {
      consoleSpy.mockReset();
    }
  });

  beforeAll(() => {
    for (let index = 0; index < INITIAL_USERS; index++) {
      (server as any).create('user', {
        name: faker.name.findName(),
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
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

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
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

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
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

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
