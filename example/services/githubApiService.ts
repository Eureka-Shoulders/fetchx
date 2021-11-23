import { HttpService } from '../../src/index';

const githubApiService = new HttpService({
  baseURL: 'https://api.github.com',
});

export default githubApiService;
