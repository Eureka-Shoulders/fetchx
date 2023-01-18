export interface User {
  name: string;
  email: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
}

export const defaultUser = {
  name: 'John Doe',
  email: 'john.doe@bestcompany.com',
};
