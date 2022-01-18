import axios from 'axios';

interface EndpointMethodDefinition {
  tags: string[];
}

interface RepositoryDefinition {
  name: string;
  tag: string;
  code: string;
  methods: { name: string; schema: EndpointMethodDefinition; path: string }[];
}

interface TagDefinition {
  name: string;
}

interface PathDefinition {
  get?: EndpointMethodDefinition;
  post?: EndpointMethodDefinition;
  delete?: EndpointMethodDefinition;
  put?: EndpointMethodDefinition;
  patch?: EndpointMethodDefinition;
}

interface SchemaFile {
  tags: TagDefinition[];
  paths: Record<string, PathDefinition>;
}

const exampleConfig = {
  schemaFile: 'https://petstore3.swagger.io/api/v3/openapi.json',
  outputDir: './openapi-example',
};

const replacers = ['[REPOSITORY_PATH]'];

async function generate(config = exampleConfig) {
  const schemaFileResponse = await axios.get(config.schemaFile);
  const schemaFile: SchemaFile = schemaFileResponse.data;

  const repositories: RepositoryDefinition[] = schemaFile.tags.map((tag) => {
    const name =
      tag.name.charAt(0).toUpperCase() + tag.name.slice(1) + 'Repository';

    return {
      ...tag,
      name,
      tag: tag.name,
      code: `export class ${name} {\n  constructor(private httpService: HttpService) {}\n\n  $METHODS$}`,
      methods: [],
    };
  });

  let resultFile = `import { HttpService, Repository } from '@euk-labs/fetchx';\n\n`;

  Object.entries(schemaFile.paths).forEach((entry) => {
    const pathDefinition = entry[1];

    Object.entries(pathDefinition).forEach(
      (method: [string, EndpointMethodDefinition]) => {
        const methodName = method[0];
        const methodSchema = method[1];
        const path = entry[0];

        const repository = repositories.find(
          (repository) => repository.tag === methodSchema.tags[0]
        );

        if (!repository) {
          return;
        }

        repository.methods.push({
          name: methodName,
          schema: methodSchema,
          path,
        });
      }
    );
  });

  repositories.forEach((repository) => {
    repository.methods.forEach((method, methodIndex) => {
      const methodSchema = method.schema;
      const functionName = method.path
        .split('/')
        .slice(1)
        .map((part) => {
          if (part.startsWith('{') && part.endsWith('}')) {
            part = part.replace('{', '').replace('}', '');
            return 'With' + part.charAt(0).toUpperCase() + part.slice(1);
          }

          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join('');

      const isLastMethod = methodIndex === repository.methods.length - 1;

      repository.code = repository.code.replace(
        '$METHODS$',
        `${
          method.name
        }${functionName}(params?: any) {\n    return this.httpService.${
          method.name
        }('${method.path}', params);\n  } ${
          isLastMethod ? '\n$METHODS$' : '\n\n  $METHODS$'
        }`
      );
    });

    resultFile += repository.code + '\n';
  });

  resultFile = resultFile.replace(/[$METHODS$]/g, '');

  return resultFile;
}

export default generate;
