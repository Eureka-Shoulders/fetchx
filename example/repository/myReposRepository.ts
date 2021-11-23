import { Repository } from '../../src';
import githubApiService from '../services/githubApiService';

const myReposRespository = new Repository(githubApiService, {
  path: '/users/SampaioLeal/repos',
});

export default myReposRespository;
