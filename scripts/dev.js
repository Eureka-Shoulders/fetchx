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

console.log('"\x1Bc" Initializing shoulders dev mode... \n');
builder.watchMode();
