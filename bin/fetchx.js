#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const { default: generate } = require('../lib/cjs/generator/openAPIGenerator');

const [, , command, ...options] = process.argv;

if (command !== 'generate') {
  console.log('Invalid command...');
  process.exit();
}

if (options.length !== 1) {
  console.log('Invalid options...');
  process.exit();
}

async function main() {
  const schemaUrl = options[0];
  console.log(await generate(schemaUrl));
}

main();
