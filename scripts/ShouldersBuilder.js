/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const rimraf = require('rimraf');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const tscAlias = require('tsc-alias');
const { ESLint } = require('eslint');
const chokidar = require('chokidar');
const { performance } = require('perf_hooks');
const debug = require('debug');
const { exec } = require('child_process');

const fileWatchLog = debug('fetchx:file-watch');
const buildLog = debug('fetchx:build');
const lintLog = debug('fetchx:lint');
const typeCheckLog = debug('fetchx:typecheck');

function getElapsedTime(time) {
  return `${(performance.now() - time).toFixed(3)}ms`;
}

class ShouldersBuilder {
  folders;
  includes;
  excludes;
  esBuildDefaultOptions;
  inputs = [];
  eslint = new ESLint({});

  constructor({ folders, includes, excludes, esBuildDefaultOptions }) {
    this.folders = folders;
    this.includes = includes;
    this.excludes = excludes;
    this.esBuildDefaultOptions = esBuildDefaultOptions;
    this.inputs = this.getInputs(this.folders.source);
  }

  getInputs(dir, result = []) {
    const filePattterns = {
      includes: this.includes,
      excludes: this.excludes,
    };

    fs.readdirSync(dir).forEach(function (file) {
      file = path.join(dir, file);
      const stat = fs.statSync(file);

      if (stat.isDirectory()) {
        getInputs(file, result);
      } else if (
        stat.isFile() &&
        file.match(filePattterns.includes) &&
        !file.match(filePattterns.excludes)
      ) {
        result.push(file);
      }
    });

    return result;
  }

  removeBuildFolder() {
    rimraf.sync(this.folders.dist);
  }

  copyPackageJson() {
    fs.copyFileSync(
      path.join('./package.json'),
      path.join(this.folders.dist, 'package.json')
    );
  }

  async lintSource() {
    const startTime = performance.now();

    const results = await this.eslint.lintFiles(this.inputs);
    const formatter = await this.eslint.loadFormatter('stylish');
    const output = formatter.format(results);

    if (output.length) {
      console.log('ESLint Results:', output);
    }

    lintLog(`Lint executed on source folder in ${getElapsedTime(startTime)}`);
  }

  async replaceTscAliasPaths() {
    await tscAlias.replaceTscAliasPaths({
      configFile: './tsconfig.json',
      outDir: `${this.folders.dist}/cjs`,
      declarationDir: `${this.folders.dist}/cjs`,
    });

    await tscAlias.replaceTscAliasPaths({
      configFile: './tsconfig.json',
      outDir: this.folders.dist,
      declarationDir: this.folders.dist,
    });
  }

  async buildEsm() {
    const startTime = performance.now();

    await esbuild.build({
      ...this.esBuildDefaultOptions,
      entryPoints: [...this.inputs],
      outbase: this.folders.source,
      format: 'esm',
      outdir: this.folders.dist,
      splitting: true,
      treeShaking: true,
    });

    buildLog(`Generated a new ESM build in ${getElapsedTime(startTime)}`);
  }

  async buildCjs() {
    const startTime = performance.now();

    await esbuild.build({
      ...this.esBuildDefaultOptions,
      entryPoints: [...this.inputs],
      format: 'cjs',
      outdir: this.folders.dist + '/cjs',
    });

    buildLog(`Generated a new CJS build in ${getElapsedTime(startTime)}`);
  }

  generateTypes() {
    return new Promise((resolve, reject) => {
      typeCheckLog('Checking types and generating declaration files...');

      exec('npm run gen-types', (error, stdout, stderr) => {
        if (error) {
          typeCheckLog('Failed to generate types');
          console.log(`error: ${error.message}`);
          return reject();
        }
        if (stderr) {
          typeCheckLog('Failed to generate types');
          console.log(`stderr: ${stderr}`);
          return reject();
        }

        typeCheckLog('Types checked and generated successfully');
        resolve();
      });
    });
  }

  async watchMode() {
    const build = async () => {
      await this.buildEsm();
      await this.buildCjs();
      await this.replaceTscAliasPaths();
      await this.lintSource();
      await this.generateTypes();
    };

    this.removeBuildFolder();
    await build();
    this.copyPackageJson();

    const watcher = chokidar.watch(this.folders.source, {
      ignored: /(^|[/\\])\../,
    });

    process.on('SIGINT', () => {
      watcher.unwatch(this.folders.source);
      watcher.close();
      process.exit(0);
    });

    watcher.on('ready', () => {
      fileWatchLog('Watching for changes...');

      watcher.on('all', async () => {
        console.clear();

        fileWatchLog('File change detected, rebuilding...');

        this.inputs = this.getInputs(this.folders.source);
        this.removeBuildFolder();
        await build();
        this.copyPackageJson();

        buildLog('Generated a new build based on your changes');
        fileWatchLog('Watching for changes...');
      });
    });
  }
}

module.exports = ShouldersBuilder;
