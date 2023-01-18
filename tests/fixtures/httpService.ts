import { HttpService } from '../../src';

const baseURL = new URL(window.location.href + 'api');
const httpService = new HttpService({
  baseURL,
});

export default httpService;
