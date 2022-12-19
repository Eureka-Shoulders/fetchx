import React from 'react';
import mockServer from './fixtures/server';
import { faker } from '@faker-js/faker';

import { getByTestId, render, waitFor } from '@testing-library/react';
import UserPage from './fixtures/UserPage';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const INITIAL_USERS = 1;
const server = mockServer();

describe('useEntity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    const { container } = render(<UserPage />);

    expect(container).toBeTruthy();
  });

  it('should show no identifier message', async () => {
    const { container } = render(<UserPage />);
    const userDisplay = getByTestId(container, 'user');

    expect(userDisplay.textContent).toContain('No identifier provided!');
  });

  it('should warn about fetching without identifier', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const { container } = render(<UserPage forceFetch />);
    const userDisplay = getByTestId(container, 'user');

    expect(userDisplay.textContent).toContain('No identifier provided!');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should show user data', async () => {
    const { container } = render(<UserPage id={'1'} />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    await waitFor(() => {
      const userName = getByTestId(container, 'user-name');
      expect(userName.textContent).toBeDefined();
    });
  });

  it('should show that user does not exist', async () => {
    const { container } = render(<UserPage id={'2'} />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Not found!');
    });
  });

  it('should warn on update without identifier', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const { container } = render(<UserPage forceUpdate />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('No identifier provided!');
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  it("should update user's name", async () => {
    const { container } = render(<UserPage id={'1'} />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    let oldName = '';
    await waitFor(() => {
      const userName = getByTestId(container, 'user-name');
      expect(userName.textContent).toBeDefined();
      oldName = userName.textContent || '';
    });

    const setRandomNameButton = getByTestId(container, 'set-random-name');
    setRandomNameButton.click();

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    await waitFor(() => {
      const userName = getByTestId(container, 'user-name');
      expect(userName.textContent).not.toEqual('');
      expect(userName.textContent).not.toEqual(oldName);
    });
  });

  it('should warn on delete without identifier', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);

    const { container } = render(<UserPage forceDelete />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('No identifier provided!');
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  it('should delete user', async () => {
    const { container } = render(<UserPage id={'1'} />);
    const userDisplay = getByTestId(container, 'user');

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    await waitFor(() => {
      const userName = getByTestId(container, 'user-name');
      expect(userName.textContent).toBeDefined();
    });

    const deleteButton = getByTestId(container, 'delete-user');
    deleteButton.click();

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Loading...');
    });

    await waitFor(() => {
      expect(userDisplay.textContent).toContain('Not found!');
    });
  });
});
