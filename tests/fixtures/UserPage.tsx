import * as React from 'react';
import usersRepository from './usersRepository';
import { observer } from 'mobx-react-lite';
import { faker } from '@faker-js/faker';

import { useEntity } from '../../src';

interface User {
  name: string;
  email: string;
}

interface UserResponse {
  user: User;
}

interface UserPageProps {
  id?: string;
  forceFetch?: boolean;
  forceUpdate?: boolean;
  forceDelete?: boolean;
}

function UserPage({ id, forceFetch, forceUpdate, forceDelete }: UserPageProps) {
  const entity = useEntity(usersRepository, id);
  const user: User | null = (entity.data as UserResponse)?.user;

  function setRandomName() {
    entity.update({ name: faker.name.fullName() });
  }

  React.useEffect(() => {
    if (forceUpdate) {
      setRandomName();
    }

    if (forceDelete) {
      entity.delete();
    }

    if (forceFetch) {
      entity.fetch();
    }
  }, [forceUpdate, forceFetch]);

  React.useEffect(() => {
    if (id) {
      entity.fetch();
    }
  }, [id]);

  if (!id) return <div data-testid="user">No identifier provided!</div>;

  if (entity.loading) return <div data-testid="user">Loading...</div>;

  if (!entity.data) return <div data-testid="user">Not found!</div>;

  return (
    <div data-testid="user">
      <p data-testid="user-name">Name: {user.name}</p>
      <p data-testid="user-email">E-mail: {user.email}</p>

      <button data-testid="set-random-name" onClick={setRandomName}>
        Set random name
      </button>
      <button data-testid="delete-user" onClick={entity.delete}>
        Delete
      </button>
    </div>
  );
}

export default observer(UserPage);
