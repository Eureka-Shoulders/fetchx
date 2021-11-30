import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        name: 'react-lib',
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      excludeDependenciesFromBundle({
        dependencies: true,
        peerDependencies: true,
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      postcss(),
      terser(),
    ],
  },
  {
    input: 'lib/esm/types/index.d.ts',
    output: [{ file: 'lib/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];
