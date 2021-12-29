import 'reflect-metadata';
import HttpService from '../src/HttpService';
import mockServer from './fixtures/server';

const server = mockServer();

describe('HttpService', () => {
  afterAll(() => {
    server.shutdown();
  });

  it('should be created', () => {
    const httpService = new HttpService({ baseURL: '/api' });

    expect(httpService).toBeTruthy();
  });

  it('should have the correct baseURL', () => {
    const httpService = new HttpService({ baseURL: '/api' });

    expect(httpService.client.defaults.baseURL).toBe('/api');
  });

  it('should have the correct default headers', () => {
    const httpService = new HttpService({ baseURL: '/api' });

    expect(httpService.client.defaults.headers.common).toEqual({
      Accept: 'application/json, text/plain, */*',
    });
  });

  it('should make a successfull GET request', async () => {
    const httpService = new HttpService({ baseURL: '/api' });
    const response = await httpService.client.get('/users');

    expect(response.status).toBe(200);
  });

  it('should throw an error when the request fails', async () => {
    const httpService = new HttpService({ baseURL: '/api' });

    await expect(httpService.client.get('/does-not-exist')).rejects.toThrow();
  });

  it('should change headers with helper method', () => {
    const httpService = new HttpService({ baseURL: '/api' });
    const fakeToken = 'fake-token';

    httpService.setHeader('authorization', fakeToken);

    expect(httpService.client.defaults.headers.common).toHaveProperty(
      'authorization',
      fakeToken
    );
  });

  it('should set request interceptor with helper method', async () => {
    const httpService = new HttpService({ baseURL: '/api' });
    const fakeToken = 'fake-token';

    httpService.setRequestInterceptor('token-injector', (config) => {
      if (config.headers) config.headers.authorization = fakeToken;

      return config;
    });

    const response = await httpService.client.get('/users');

    expect(response.config.headers).toHaveProperty('authorization', fakeToken);
  });

  it('should set response interceptor with helper method', async () => {
    const httpService = new HttpService({ baseURL: '/api' });

    httpService.setResponseInterceptor('now-injector', (response) => {
      if (response.headers) response.headers.nowDate = new Date().toISOString();

      return response;
    });

    const response = await httpService.client.get('/users');

    expect(response.headers).toHaveProperty('nowDate');
  });

  it('should eject request interceptors with helper method', async () => {
    const httpService = new HttpService({ baseURL: '/api' });
    const fakeToken = 'fake-token';

    httpService.setRequestInterceptor('token-injector', (config) => {
      if (config.headers) config.headers.authorization = fakeToken;

      return config;
    });

    httpService.ejectInterceptor('token-injector', 'request');

    const response = await httpService.client.get('/users');

    expect(response.config.headers).not.toHaveProperty('authorization');
  });

  it('should eject response interceptors with helper method', async () => {
    const httpService = new HttpService({ baseURL: '/api' });
    httpService.setResponseInterceptor('now-injector', (response) => {
      if (response.headers) response.headers.nowDate = new Date().toISOString();

      return response;
    });
    const response = await httpService.client.get('/users');
    expect(response.headers).toHaveProperty('nowDate');

    httpService.ejectInterceptor('now-injector', 'response');

    const newResponse = await httpService.client.get('/users');
    expect(newResponse.config.headers).not.toHaveProperty('authorization');
  });
});
