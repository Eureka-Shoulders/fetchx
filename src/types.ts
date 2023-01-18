export interface RequestInitWithParams extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | object> | URLSearchParams;
  body?: BodyInit | Record<string, unknown>;
}
