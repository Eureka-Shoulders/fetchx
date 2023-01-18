import { Repository } from '../src/Repository';
import httpService from './fixtures/httpService';
import mockServer from './fixtures/server';
import {
  defaultUser,
  User,
  UserResponse,
  UsersResponse,
} from './fixtures/users';
import { afterAll, describe, expect, it } from 'vitest';

const server = mockServer();

describe('Repository', () => {
  afterAll(() => {
    server.shutdown();
  });

  const repository = new Repository(httpService, { path: '/users' });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should Create a new entity', async () => {
    const entity = await repository.create<User, UserResponse>(defaultUser);

    expect(entity.data.user).toEqual({ ...defaultUser, id: '1' });
  });

  it('should Read all entities', async () => {
    const entities = await repository.read<UsersResponse>();

    expect(entities.data.users).toContainEqual({ ...defaultUser, id: '1' });
  });

  it('should Read all entities with params', async () => {
    const entities = await repository.read<UsersResponse>({
      params: {
        name: 'Testerson',
      },
    });

    expect(entities.data.users).toHaveLength(0);
  });

  it('should Read an entity', async () => {
    const entity = await repository.read<UserResponse>('1');

    expect(entity.data.user).toEqual({ ...defaultUser, id: '1' });
  });

  it('should Update an entity with PATCH', async () => {
    let entity = await repository.patch<Partial<User>, UserResponse>('1', {
      name: 'John Doe Updated',
    });

    expect(entity.data.user).toEqual({
      ...defaultUser,
      id: '1',
      name: 'John Doe Updated',
    });

    entity = await repository.read('1');

    expect(entity.data.user).toEqual({
      ...defaultUser,
      id: '1',
      name: 'John Doe Updated',
    });
  });

  it('should Update an entity with PUT', async () => {
    let entity = await repository.put<User, UserResponse>('1', {
      ...defaultUser,
      name: 'John Doe Updated',
    });

    expect(entity.data.user).toEqual({
      ...defaultUser,
      id: '1',
      name: 'John Doe Updated',
    });

    entity = await repository.read('1');

    expect(entity.data.user).toEqual({
      ...defaultUser,
      id: '1',
      name: 'John Doe Updated',
    });
  });

  it('should Delete an entity', async () => {
    await repository.delete('1');

    const entities = await repository.read<UsersResponse>();

    expect(entities.data.users).toHaveLength(0);
  });
});
