import { writeFileSync } from 'typedoc/dist/lib/utils';
import generate from '../src/generator/openAPIGenerator';

describe('OpenAPI Generator', () => {
  it('should be created', async () => {
    const result = await generate();

    writeFileSync('openapi.ts', result);
  });
});
