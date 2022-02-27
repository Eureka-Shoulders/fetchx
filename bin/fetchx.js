#!/usr/bin/env node

const { default: generate } = require('../lib/generator/openAPIGenerator');

const [, , command, ...options] = process.argv;

if (command !== 'generate') {
  console.log('Invalid command...');
  process.exit();
}

if (options.length !== 1) {
  console.log('Invalid options...');
  process.exit();
}

console.log(generate(options[0]));
