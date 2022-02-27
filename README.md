# FetchX

![npm](https://img.shields.io/npm/v/@euk-labs/fetchx)
![NPM](https://img.shields.io/npm/l/@euk-labs/fetchx)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Eureka-Shoulders/fetchx/CI)
![npm](https://img.shields.io/npm/dw/@euk-labs/fetchx)

FetchX is a fetching library made for React built with [axios](https://github.com/axios/axios) and [mobx](https://github.com/mobxjs/mobx) that give you an easy way to handle CRUD of entities.

## Installation

Using npm:

```bash
npm i @euk-labs/fetchx mobx mobx-react-lite
```

Using yarn:

```bash
yarn add @euk-labs/fetchx mobx mobx-react-lite
```

### Dependencies

- Axios is used to fetch data from HTTP requests
- MobX is used to generate Stores and Hooks powered by these stores to make a beautiful reactive way to control the data on your interfaces.

## Usage

### `HttpService`

The HttpService is a class that will work as a wrapper for axios. It will handle all the requests and provide helpers to make your life easier.

### `Repository`

Repositories will abstract the CRUD operations of your entities. No state is stored in the repository, it only provides methods to fetch, create, update and delete entities.

### `ListStore`

ListStores are a set of states and actions built with MobX to handle a list of entities with resources like pagination, filters and inifinite scroll strategies.
They need a repository to work and know how to fetch the data.

Please read the MobX documentation to know more about the different ways to make your components reactive.

### `useList`

A hook to use the ListStore in your components. It will return the current state of the ListStore and the actions to interact with it.
Like ListStore, it needs a repository to work.

### `EntityStore`

In contrast with the ListStore, EntityStores can only handle a single entity. It can be used to fetch the entity by an identifier, update the loaded entity and delete it.

### `useEntity`

A hook to use the EntityStore in your components. It will return the current state of the EntityStore and the actions to interact with it.
Like EntityStore, it needs a repository to work.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
