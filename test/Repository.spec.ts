import { HttpService, Repository } from '../src';
import mockServer from './mockedAPI';

describe('Repository', () => {
  beforeAll(() => {
    mockServer();
  });

  const apiClient = new HttpService({ baseURL: '/api' });
  const repository = new Repository(apiClient, { path: '/users' });
  const defaultEntity = { name: 'John Doe', email: 'john.doe@bestcompany.com' };

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should Create a new entity', async () => {
    const entity = await repository.create(defaultEntity);

    expect(entity.data.user).toEqual({ ...defaultEntity, id: '1' });
  });

  it('should Read all entities', async () => {
    const entities = await repository.read();

    expect(entities.data.users).toContainEqual({ ...defaultEntity, id: '1' });
  });

  it('should Read an entity', async () => {
    const entity = await repository.read('1');

    expect(entity.data.user).toEqual({ ...defaultEntity, id: '1' });
  });

  it('should Update an entity with PATCH', async () => {
    let entity = await repository.patch('1', { name: 'John Doe Updated' });

    expect(entity.data.user).toEqual({
      ...defaultEntity,
      id: '1',
      name: 'John Doe Updated',
    });

    entity = await repository.read('1');

    expect(entity.data.user).toEqual({
      ...defaultEntity,
      id: '1',
      name: 'John Doe Updated',
    });
  });

  it('should Update an entity with PUT', async () => {
    let entity = await repository.put('1', { name: 'John Doe Updated' });

    expect(entity.data.user).toEqual({
      ...defaultEntity,
      id: '1',
      name: 'John Doe Updated',
    });

    entity = await repository.read('1');

    expect(entity.data.user).toEqual({
      ...defaultEntity,
      id: '1',
      name: 'John Doe Updated',
    });
  });

  it('should Delete an entity', async () => {
    await repository.delete('1');

    const entities = await repository.read();

    expect(entities.data.users).toHaveLength(0);
  });
});
