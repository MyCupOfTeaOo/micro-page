import { IBundleOptions } from 'father';

const fs = require('fs');

let babelPlugin = [];

if (fs.existsSync('./.babelrc')) {
  const babelJson = JSON.parse(fs.readFileSync('./.babelrc').toString());
  babelPlugin = babelPlugin.concat(babelJson.plugins || []);
}

const options: IBundleOptions = {
  esm: 'babel',
  extraBabelPlugins: babelPlugin,
  pkgs: [
    'micro-page-core',
    'micro-page-react',
    'micro-page-plugin-preset',
    'micro-page',
  ],
};

export default options;
