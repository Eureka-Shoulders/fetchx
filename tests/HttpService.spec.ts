import { HttpService } from '../src/HttpService';
import mockServer from './fixtures/server';
import { afterAll, describe, expect, it } from 'vitest';

const server = mockServer();
const baseURL = new URL(`${window.location.href}api`);

describe('HttpService', () => {
  afterAll(() => {
    server.shutdown();
  });

  it('should be created', () => {
    const httpService = new HttpService({ baseURL });

    expect(httpService).toBeTruthy();
  });

  it('should have the correct baseURL', () => {
    const httpService = new HttpService({ baseURL });

    expect(httpService.config.baseURL.toString()).toBe(baseURL.toString());
  });

  it('should have the correct default headers', () => {
    const httpService = new HttpService({ baseURL });

    expect(httpService.config.defaultHeaders).toEqual({
      Accept: 'application/json, text/plain, */*',
    });
  });

  it('should make a successfull GET request', async () => {
    const httpService = new HttpService({ baseURL });
    const response = await httpService.fetch('/users');

    expect(response.status).toBe(200);
  });

  it('should throw an error when the request fails', async () => {
    const httpService = new HttpService({ baseURL });

    await expect(httpService.fetch('/does-not-exist')).rejects.toThrow();
  });

  it('should change headers with helper method', () => {
    const httpService = new HttpService({ baseURL });
    const fakeToken = 'fake-token';

    httpService.setHeader('authorization', fakeToken);

    expect(httpService.config.defaultHeaders).toHaveProperty(
      'authorization',
      fakeToken
    );
  });

  it('should set request interceptor with helper method', async () => {
    const httpService = new HttpService({ baseURL });
    const fakeToken = 'fake-token';

    httpService.setInterceptor('token-injector', (meta, nextFn) => {
      if (!meta.config) {
        meta.config = {};
      }

      const headers = new Headers(meta.config?.headers);
      headers.set('authorization', fakeToken);
      meta.config.headers = headers;

      return nextFn();
    });

    const response = await httpService.fetch('/me');
    const data = await response.json();

    expect(data.token).toBe(fakeToken);
  });

  it('should set response interceptor with helper method', async () => {
    const httpService = new HttpService({ baseURL });

    httpService.setInterceptor('now-injector', async (meta, nextFn) => {
      const response = await nextFn();
      response.headers.set('nowDate', new Date().toISOString());
      return response;
    });

    const response = await httpService.fetch('/users');

    expect(response.headers.get('nowDate')).toEqual(expect.any(String));
  });

  it('should remove request interceptors with helper method', async () => {
    const httpService = new HttpService({ baseURL });
    const fakeToken = 'fake-token';

    httpService.setInterceptor('token-injector', (meta, nextFn) => {
      if (!meta.config) {
        meta.config = {};
      }

      const headers = new Headers(meta.config?.headers);
      headers.set('authorization', fakeToken);
      meta.config.headers = headers;
      return nextFn();
    });

    const response = await httpService.fetch('/me');
    const data = await response.json();

    expect(data.token).toBe(fakeToken);

    httpService.removeInterceptor('token-injector');

    const newResponse = await httpService.fetch('/users');
    const newData = await newResponse.json();

    expect(newData.token).toBeUndefined();
  });

  it('should remove response interceptors with helper method', async () => {
    const httpService = new HttpService({ baseURL });

    httpService.setInterceptor('now-injector', async (meta, nextFn) => {
      const response = await nextFn();
      response.headers.set('nowDate', new Date().toISOString());
      return response;
    });

    const response = await httpService.fetch('/users');
    expect(response.headers.get('nowDate')).toEqual(expect.any(String));

    httpService.removeInterceptor('now-injector');

    const newResponse = await httpService.fetch('/users');
    expect(newResponse.headers.get('nowDate')).toBeNull();
  });
});
