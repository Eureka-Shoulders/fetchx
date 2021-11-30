import { useEffect, useMemo } from 'react';
import { Identifier } from './types';
import Repository from './Repository';
import EntityStore from './EntityStore';

/**
 * A hook that returns an `EntityStore` to manage an entity with the given identifier.
 * @param repository A {@link Repository} instance
 * @param id The identifier of the entity to be loaded
 * @returns A ${@link EntityStore} instance
 */
export default function useEntity(repository: Repository, id?: Identifier) {
  const dataStore = useMemo(() => new EntityStore(repository), []);

  useEffect(() => {
    if (typeof id === 'string' || typeof id === 'number') {
      dataStore.setIdentifier(id);
    }
  }, [id]);

  return dataStore;
}
