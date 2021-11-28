# FetchX

![npm](https://img.shields.io/npm/v/@euk-labs/fetchx)
![NPM](https://img.shields.io/npm/l/@euk-labs/fetchx)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Eureka-Shoulders/fetchx/CI)
![npm](https://img.shields.io/npm/dw/@euk-labs/fetchx)

FetchX is a fetching library made for React built with [axios](https://github.com/axios/axios) and [mobx](https://github.com/mobxjs/mobx) that give you an easy way to handle CRUD of entities.

## Installation

Using npm:

```bash
npm i @euk-labs/fetchx axios mobx
```

Using yarn:

```bash
yarn add @euk-labs/fetchx axios mobx
```

### Dependencies

- Axios is used to fetch data from HTTP requests
- MobX is used to generate Stores and Hooks powered by these stores to make a beautiful reactive way to control the data on your interfaces.

## Usage

### HttpService

```tsx
import { HttpService } from '@euk-labs/fetchx';

const httpService = new HttpService({ baseURL: 'http://localhost:3030/api' });

httpService.setHeader('authorization', 'Bearer token-123');

httpService.client.get('/users');
httpService.client.post('/users', { name: 'John Doe' });
```

### 
y

```tsx
import { Repository } from '@euk-labs/fetchx';

interface User {
  name: string;
  email: string;
}

interface UserResponse {
  user: User;
}

interface UsersResponse {
  users: User;
}

// Initializing users repository
const usersRepository = new Repository(httpService, { path: "/users" });

// Creating entities
const createdEntity = await usersRepository.create<User, UserResponse>({
  name: 'John Doe',
  email: 'john.doe@bestcompany.com',
});

// Reading entities
const entities = await usersRepository.read<UsersResponse>();
const entitiesWithParams = await usersRepository.read<UsersResponse>({
	name: "John",
});
const entityById = await usersRepository.read<UserResponse>("1");

// Updating entities
const updatedEntityWithPatch = await usersRepository.patch<Partial<User>, UserResponse>("1", {
	name: "John Doe Updated With Patch",
});
let updatedEntityWithPut = await usersRepository.put<User, UserResponse>('1', {
	name: 'John Doe Updated With Put',
	email:
});

// Deleting entity
await repository.delete('1');
```

### ListStore

```tsx
import { ListStore } from '@euk-labs/fetchx';

const usersListStore = new ListStore(usersRepository, {
  limit: 10,
  limitField: 'limit',
});

// Here we update the state os usersListStore with fresh data
await usersListStore.fetch();

// Maybe you have only 10 users and want to show more to user
usersListStore.setPage(2);
await usersListStore.fetch();

// Want infinite scroll?
const usersListStore = new ListStore(usersRepository, {
  limit: 10,
  limitField: 'limit',
  infiniteScroll: true,
});

await usersListStore.fetch();
usersListStore.setPage(2);
await usersListStore.fetch();

console.log(usersListStore.list.length); // It will be more than 10, because it increments the list on page change
```

### useList

```tsx
import * as React from 'react';
import { HttpService, Repository, useList } from '@euk-labs/fetchx';
import { observer } from 'mobx-react-lite';

interface User {
  id: string;
  name: string;
  email: string;
}

const httpService = new HttpService({
  baseURL: 'http://localhost:3030/api',
});
const usersRepository = new Repository(httpService, { path: '/users' });

function UsersPage() {
  const usersList = useList(usersRepository);

  React.useEffect(() => {
    usersList.fetch();
  }, []);

  if (usersList.loading) {
    return <div>Loading...</div>;
  }

  if (usersList.list.length === 0) {
    return <div>No users</div>;
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
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
