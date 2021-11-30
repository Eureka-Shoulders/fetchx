import { useEffect, useMemo } from 'react';
import { Identifier } from './types';
import Repository from './Repository';
import EntityStore from './EntityStore';

export default function useEntity(repository: Repository, id?: Identifier) {
  const dataStore = useMemo(() => new EntityStore(repository), []);

  useEffect(() => {
    if (typeof id === 'string' || typeof id === 'number') {
      dataStore.setIdentifier(id);
    }
  }, [id]);

  return dataStore;
}
