import { ListStore } from "../src";
import mockServer from "./fixtures/server";
import usersRepository from "./fixtures/usersRepository";
import faker from "faker";
import { Server } from "miragejs";

const INITIAL_USERS = 15;
let server = mockServer();

describe("ListStore", () => {
  beforeAll(() => {
    for (let index = 0; index < INITIAL_USERS; index++) {
      (server as any).create("user", {
        name: faker.name.findName(),
        email: faker.internet.email(),
      });
    }
  });

  afterAll(() => {
    server.shutdown();
  });

  it("should be created", () => {
    const usersListStore = new ListStore(usersRepository, {
      limit: 10,
      limitField: "limit",
    });

    expect(usersListStore).toBeTruthy();
  });

  it("should fetch first 10 users with limit field and results field", async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: "limit",
      resultsField: "users",
    });

    await store.fetch();

    expect(store.list.length).toEqual(10);
  });

  it("should fetch last 5 users with limit field and results field", async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: "limit",
      resultsField: "users",
    });

    store.setPage(2);
    await store.fetch();

    expect(store.list.length).toEqual(5);
  });

  it("should increment list on change page", async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: "limit",
      resultsField: "users",
      infiniteScroll: true,
    });

    await store.fetch();
    store.setPage(2);
    await store.fetch();

    expect(store.list.length).toEqual(INITIAL_USERS);
  });

  it("should fetch and read all the data object throwing an error", async () => {
    const store = new ListStore(usersRepository, {
      limit: 10,
      limitField: "limit",
    });

    await expect(store.fetch()).rejects.toThrow();
  });
});
