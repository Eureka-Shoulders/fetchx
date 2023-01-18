export interface RequestInitWithParams extends RequestInit {
  params?: Record<string, string | object> | URLSearchParams;
}
