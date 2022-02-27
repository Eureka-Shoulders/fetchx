import axios from 'axios';
import { APITag } from './types';
import * as R from 'ramda';
import { getType, toPascalCase } from './utils';

interface PropSchema {
  type?: string;
  description?: string;
  enum?: string[];
  $ref?: string;
  items?: {
    $ref?: string;
    type: string;
  };
}

const exampleConfig = {
  schemaFile: 'https://petstore3.swagger.io/api/v3/openapi.json',
  outputDir: './openapi-example',
};

/**
 * Templates
 */
const importsTemplate = `import { HttpService, Repository } from '@euk-labs/fetchx';
`;
const interfaceTemplate = `
export interface [INTERFACE_NAME] {
[PROPERTIES]
}
`;
const repositoryTemplate = `[JSDOC]
export class [REPO_NAME]Repository extends Repository {
  constructor(private httpService: HttpService) {
    super(httpService, { path: '/[PATH]' });
  }
}
`;

function buildRepository(tag: any) {
  let result = repositoryTemplate;

  if (tag.description) {
    result = R.replace(/\[JSDOC\]/g, `\n/** ${tag.description} */`, result);
  } else {
    result = R.replace(/\[JSDOC\]/g, '', result);
  }

  return R.pipe(
    R.replace(/\[REPO_NAME\]/g, toPascalCase(tag.name)),
    R.replace(/\[PATH\]/g, tag.name)
  )(result);
}

function buildInterface(name: string, schema: any) {
  const interfaceStr = R.replace(
    '[INTERFACE_NAME]',
    `I${toPascalCase(name)}`,
    interfaceTemplate
  );

  if (schema.type === 'object') {
    let properties = '';

    if (schema.properties) {
      properties = R.pipe(
        R.toPairs,
        R.map(([propName, propSchema]: [string, PropSchema]) => {
          if (R.has('enum', propSchema)) {
            const getEnumerations = R.pipe(
              R.map((item) => `'${item}'`),
              R.join(' | ')
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return `  ${propName}: ${getEnumerations(propSchema.enum!)};`;
          }

          console.log(propSchema);
          if (R.has('items', propSchema)) {
            if (R.has('$ref', propSchema.items)) {
              return `  ${propName}: I${R.last(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                propSchema.items.$ref!.split('/')
              )}[];`;
            } else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return `  ${propName}: ${getType(propSchema.items!.type)}[];`;
            }
          }

          if (R.has('$ref', propSchema)) {
            return `  ${propName}: I${R.last(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              propSchema.$ref!.split('/')
            )};`;
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return `  ${propName}: ${getType(propSchema.type!)};`;
        }),
        R.join('\n')
      )(schema.properties);
    }

    return interfaceStr.replace('[PROPERTIES]', properties);
  }
}

async function generate(schemaUrl: string) {
  const schemaFileResponse = await axios.get(schemaUrl);
  const schemaFile = schemaFileResponse.data;

  let resultCode = `${importsTemplate}`;

  /**
   * Interface Creation
   */
  R.pipe(
    R.toPairs,
    R.forEach(([name, schema]: [any, any]) => {
      const interfaceStr = buildInterface(name, schema);
      if (!interfaceStr) return;

      resultCode += interfaceStr;
    })
  )(schemaFile.components.schemas);

  /**
   * Repository creation
   */
  R.forEach((tag: APITag) => {
    resultCode += buildRepository(tag);
  }, schemaFile.tags);

  return resultCode;
}

export default generate;
