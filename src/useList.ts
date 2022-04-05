import { useEffect, useState } from 'react';
import { ListStoreOptions } from './types';
import ListStore from './ListStore';
import Repository from './Repository';

/**
 * A hook that returns an `ListStore` to manage an entity list.
 * @param repository A {@link Repository} instance
 * @param options Options to configure the `ListStore`
 * @returns A ${@link ListStore} instance
 */
export default function useList<T>(
  repository: Repository,
  options?: ListStoreOptions
) {
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
