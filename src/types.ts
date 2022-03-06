export type Identifier = string | number;

export interface RepositoryOptions {
  path: string;
}

export interface ListStoreOptions {
  infiniteScroll?: boolean;
  skipField: string;
  limitField: string;
  limit: number;
  resultsField?: string;
  totalCountField?: string;

  cacheId?: string;
  cacheDuration?: number;
}
