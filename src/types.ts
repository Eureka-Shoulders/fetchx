export type Identifier = string | number;

export interface RepositoryOptions {
  path: string;
}

export interface ListStoreOptions {
  skipField?: string;
  limitField?: string;
  limit?: number;
  infiniteScroll?: boolean;
  refetchOnFocus?: boolean;
  resultsField?: string;
  totalCountField?: string;
  defaultParams?: Record<string, string | number | boolean>;
}
