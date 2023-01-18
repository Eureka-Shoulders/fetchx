import { useEffect, useState } from 'react';
import { ListStore, ListStoreOptions } from './ListStore';
import { Repository } from './Repository';

export function useList<T>(repository: Repository, options?: ListStoreOptions) {
  const [dataStore] = useState(
    () => new ListStore<T>(repository, options || {})
  );

  useEffect(() => {
    if (options?.refetchOnFocus) {
      dataStore.startFocusListener();
    }

    return () => {
      dataStore.removeFocusListener();
    };
  }, []);

  return dataStore;
}
