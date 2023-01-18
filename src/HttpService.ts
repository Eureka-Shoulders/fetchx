import { FetchxError } from './errors';
import { RequestInitWithParams } from './types';
import { isPlainObject } from './utils';

interface HttpServiceConfig {
  baseURL: URL;
  defaultHeaders: Record<string, string>;
  credentials?: RequestCredentials;
}

export interface HttpServiceOptions
  extends Omit<HttpServiceConfig, 'defaultHeaders'> {
  defaultHeaders?: Record<string, string>;
}

export type InterceptorFn = (
  meta: { path: string; config?: RequestInitWithParams },
  nextFn: () => Promise<Response>
) => Promise<Response>;

export class HttpService {
  readonly config: HttpServiceConfig;
  private interceptors: Map<string, InterceptorFn> = new Map();

  constructor(readonly options: HttpServiceOptions) {
    this.config = {
      ...options,
      defaultHeaders: {
        Accept: 'application/json, text/plain, */*',
        ...options.defaultHeaders,
      },
    };
  }

  private async nativeFetch(path: string, config?: RequestInitWithParams) {
    const { defaultHeaders, baseURL, ...defaultConfigs } = this.config;
    const url = new URL(baseURL.toString() + path);
    const headers = new Headers(defaultHeaders);
    let body: BodyInit | undefined;

    if (config?.params) {
      if (config.params instanceof URLSearchParams) {
        config.params.forEach((value, key) => {
          url.searchParams.set(key, value);
        });
      }

      if (typeof config.params === 'object') {
        Object.entries(config.params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
    }

    if (config?.headers) {
      if (config.headers instanceof Headers) {
        config.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      }

      if (Array.isArray(config.headers)) {
        config.headers.forEach(([key, value]) => {
          headers.set(key, value);
        });
      }

      if (typeof config.headers === 'object') {
        Object.entries(config.headers).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }
    }
    if (config?.body) {
      if (typeof config.body === 'object' && isPlainObject(config.body)) {
        body = JSON.stringify(config.body);
        headers.set('Content-Type', 'application/json');
      } else {
        body = config.body;
      }
    }

    const response = await fetch(url, {
      ...defaultConfigs,
      ...config,
      body,
      headers,
    });

    if (!response.ok) {
      throw new FetchxError({ ...config, headers }, response);
    }

    return response;
  }

  async fetch(
    path: string,
    config = {} as RequestInitWithParams
  ): Promise<Response> {
    const fetchFn = this.nativeFetch.bind(this);
    const interceptors = Array.from(this.interceptors.values());
    let next = 0;

    async function nextFn() {
      const interceptor = interceptors[next++];
      const meta = { path, config };

      if (!interceptor) {
        return await fetchFn(path, config);
      }

      return await interceptor(meta, nextFn);
    }

    return await nextFn();
  }

  setHeader(header: string, value: string) {
    this.config.defaultHeaders[header] = value;
  }

  setInterceptor(id: string, interceptor: InterceptorFn) {
    this.interceptors.set(id, interceptor);
  }

  removeInterceptor(id: string) {
    this.interceptors.delete(id);
  }
}
