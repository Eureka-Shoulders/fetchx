import React from 'react';
import mockServer from './fixtures/server';
import { faker } from '@faker-js/faker';

import { getByTestId, render, waitFor } from '@testing-library/react';
import UsersPage from './fixtures/UsersPage';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const INITIAL_USERS = 15;
const server = mockServer();

describe('useList', () => {
  beforeAll(() => {
    for (let index = 0; index < INITIAL_USERS; index++) {
      (server as any).create('user', {
        name: faker.name.fullName(),
        email: faker.internet.email(),
      });
    }
  });

  afterAll(() => {
    server.shutdown();
  });

  it('should be created', () => {
    const { container } = render(<UsersPage />);

    expect(container).toBeTruthy();
  });

  it('should render the list of users', async () => {
    const { container } = render(<UsersPage />);
    const usersList = getByTestId(container, 'usersList');

    expect(usersList.textContent).toContain('Loading...');
    waitFor(() => {
      expect(usersList.textContent).not.toContain('Loading...');
    });
  });
});
