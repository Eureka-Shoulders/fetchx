import { ListStore } from '../src';
import usersRepository from './fixtures/usersRepository';

describe('ListStore', () => {
  it('should be created', () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: 'limit',
    });

    expect(store).toBeTruthy();
  });
});
