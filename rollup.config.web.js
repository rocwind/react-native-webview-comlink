import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'lib/web.js',
  output: {
    file: 'lib/web.bundle.js',
    format: 'umd',
    name: 'RNWebviewComlink',
  },
  plugins: [
    resolve({
      // some package.json files have a `browser` field which
      // specifies alternative files to load for people bundling
      // for the browser. If that's you, use this option, otherwise
      // pkg.browser will be ignored
      browser: true,  // Default: false

      // not all files you want to resolve are .js files
      extensions: [ '.mjs', '.js', '.jsx', '.json' ],  // Default: [ '.mjs', '.js', '.json', '.node' ]
    }),
  ]
};
