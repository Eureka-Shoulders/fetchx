/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const rimraf = require('rimraf');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const tscAlias = require('tsc-alias');

const distFolder = './lib';
const sourceFolder = './src';
const includes = new RegExp('.+\\.(ts|tsx)$');
const excludes = new RegExp('.+\\.stories\\.js$');

function getInputs(dir, result = []) {
  fs.readdirSync(dir).forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      getInputs(file, result);
    } else if (stat.isFile() && file.match(includes) && !file.match(excludes)) {
      result.push(file);
    }
  });

  return result;
}

const inputs = getInputs(sourceFolder);
const commomEsbuildOptions = {
  entryPoints: [...inputs],
  outbase: sourceFolder,
  target: 'es6',
  loader: {
    '.json': 'json',
    '.ts': 'ts',
  },
  minify: true,
};

rimraf(distFolder, async (err) => {
  if (err) console.error(err);

  console.time('Generating ESM output...');
  await esbuild.build({
    ...commomEsbuildOptions,
    format: 'esm',
    outdir: distFolder,
    splitting: true,
    treeShaking: true,
  });
  console.timeEnd('Generating ESM output...');

  console.time('Generating CJS output...');
  await esbuild.build({
    ...commomEsbuildOptions,
    format: 'cjs',
    outdir: distFolder + '/cjs',
  });
  console.timeEnd('Generating CJS output...');

  await tscAlias.replaceTscAliasPaths({
    configFile: './tsconfig.json',
    outDir: './lib/cjs',
    declarationDir: './lib/cjs',
  });

  await tscAlias.replaceTscAliasPaths({
    configFile: './tsconfig.json',
    outDir: './lib',
    declarationDir: './lib',
  });

  fs.copyFileSync(
    path.join('./package.json'),
    path.join(distFolder, 'package.json')
  );
});
