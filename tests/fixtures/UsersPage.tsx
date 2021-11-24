import * as React from 'react';
import { useList } from '../../src';
import usersRepository from './usersRepository';
import { observer } from 'mobx-react-lite';

interface User {
  id: string;
  name: string;
  email: string;
}

function UsersPage() {
  const usersList = useList(usersRepository);

  React.useEffect(() => {
    usersList.fetch();
  }, []);

  return (
    <div data-testid="usersList">
      {usersList.list.length
        ? (usersList.list as User[]).map(user => (
            <p key={user.id}>- {user.name}</p>
          ))
        : 'Loading...'}
    </div>
  );
}

export default observer(UsersPage);
