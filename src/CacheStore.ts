interface CacheOptions {
  hash: string;
  /**
   * The max time in milliseconds to keep the cache.
   */
  duration?: number;
}

interface CachedData {
  data: unknown;
  hash: string;
  timeout?: number;
}

class CacheStore {
  cachedData = new Map<string, CachedData>();

  set(key: string, value: unknown, options: CacheOptions) {
    clearTimeout(this.cachedData.get(key)?.timeout);

    let timeout = 0;

    if (options.duration) {
      timeout = setTimeout(() => {
        this.remove(key);
      }, options.duration);
    }

    this.cachedData.set(key, { data: value, timeout, hash: options.hash });
  }

  remove(key: string) {
    clearTimeout(this.cachedData.get(key)?.timeout);

    this.cachedData.delete(key);
  }

  get(key: string, hash: string) {
    const cachedData = this.cachedData.get(key);

    if (cachedData?.hash !== hash) {
      return undefined;
    }

    return cachedData.data;
  }
}

const cacheStore = new CacheStore();
export default cacheStore;
