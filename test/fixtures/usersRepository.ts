import { Repository } from '../../src';
import httpService from './httpService';

const usersRepository = new Repository(httpService, { path: '/users' });

export default usersRepository;
