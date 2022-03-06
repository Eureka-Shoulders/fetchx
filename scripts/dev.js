/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const ShouldersBuilder = require('./ShouldersBuilder');

const commomEsbuildOptions = {
  target: 'es6',
  loader: {
    '.json': 'json',
    '.ts': 'ts',
  },
  minify: true,
  color: true,
};
const includes = new RegExp('.+\\.(ts|tsx)$');
const excludes = new RegExp('.+\\.stories\\.js$');

const builder = new ShouldersBuilder({
  folders: {
    dist: './lib',
    source: './src',
  },
  includes,
  excludes,
  esBuildDefaultOptions: commomEsbuildOptions,
});

console.clear();
console.log('Initializing shoulders dev mode...');
builder.watchMode();