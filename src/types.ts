export type Identifier = string | number;

export interface RepositoryOptions {
  path: string;
}

export interface ListStoreOptions {
  infiniteScroll?: boolean;
  limitField: string;
  limit: number;
  resultsField?: string;
}
