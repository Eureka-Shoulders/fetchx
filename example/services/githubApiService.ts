import { HttpService } from '@eureka/fetchx';

const githubApiService = new HttpService({
  baseURL: 'https://api.github.com',
});

export default githubApiService;
