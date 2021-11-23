import { useMemo } from 'react';
import ListStore from './ListStore';
import Repository from './Repository';

export default function useList(repository: Repository) {
  const dataStore = useMemo(() => new ListStore(repository), []);

  return dataStore;
}
