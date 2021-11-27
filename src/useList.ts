import { useMemo } from 'react';
import { ListStoreOptions } from './types';
import ListStore from './ListStore';
import Repository from './Repository';

export default function useList(
  repository: Repository,
  options?: ListStoreOptions
) {
  const defaultOptions = {
    limitField: 'limit',
    limit: 10,
  };
  const dataStore = useMemo(
    () => new ListStore(repository, options || defaultOptions),
    []
  );

  return dataStore;
}
