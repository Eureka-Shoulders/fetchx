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
  const usersList = useList(usersRepository, {
    resultsField: 'users',
  });

  React.useEffect(() => {
    usersList.fetch();
  }, []);

  if (usersList.loading) {
    return <div data-testid="usersList">Loading...</div>;
  }

  if (usersList.list.length === 0) {
    return <div data-testid="usersList">No users</div>;
  }

  return (
    <div data-testid="usersList">
      {(usersList.list as User[]).map((user) => (
        <p key={user.id}>- {user.name}</p>
      ))}
    </div>
  );
}

export default observer(UsersPage);
