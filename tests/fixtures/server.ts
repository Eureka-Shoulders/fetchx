import { createServer, Model, Response } from 'miragejs';

interface ListParams extends Record<string, string> {
  skip: string;
  limit: string;
}

export default function mockServer() {
  const server = createServer({
    environment: 'test',

    models: {
      user: Model,
    },

    routes() {
      this.namespace = 'api';

      this.get('/does-not-exist', (schema: any, request) => {
        return new Response(404);
      });

      this.get('/me', (schema: any, request) => {
        const headers = request.requestHeaders;
        const token = headers.authorization;

        return {
          token,
        };
      });

      this.post('/users', (schema: any, request) => {
        const { name, email } = JSON.parse(request.requestBody);
        const user = schema.create('user', {
          name,
          email,
        });

        return user;
      });

      this.get('/users', (schema: any, request) => {
        const params = request.queryParams as ListParams;
        const users = schema.users.all();
        const results = {
          totalCount: users.models.length,
          users: users.models.filter((user: any) => {
            if (!params.name) return true;
            return user.name.includes(params.name);
          }),
        };

        if (params.limit && params.skip) {
          results.users = results.users.slice(
            +params.skip,
            +params.skip + +params.limit
          );
        }

        return results;
      });

      this.get('/users/:id', (schema: any, request) => {
        return schema.users.find(request.params.id);
      });

      this.patch('/users/:id', (schema, request) => {
        const user = schema.find('user', request.params.id);
        const newInformations = JSON.parse(request.requestBody);

        if (!user) {
          return new Response(
            404,
            {},
            {
              error: 'User not found',
            }
          );
        }

        user.update(newInformations);

        return user;
      });

      this.put('/users/:id', (schema, request) => {
        const user = schema.find('user', request.params.id);
        const newInformations = JSON.parse(request.requestBody);

        if (!user) {
          return new Response(
            404,
            {},
            {
              error: 'User not found',
            }
          );
        }

        user.update(newInformations);

        return user;
      });

      this.delete('/users/:id', (schema, request) => {
        const user = schema.find('user', request.params.id);

        if (!user) {
          return new Response(
            404,
            {},
            {
              error: 'User not found',
            }
          );
        }

        user.destroy();

        return {};
      });
    },
  });

  return server;
}
