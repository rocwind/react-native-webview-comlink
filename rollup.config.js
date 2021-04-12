import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

export default {
    input: 'lib/web/web.js',
    output: {
        file: 'lib/web/web.bundle.js',
        format: 'umd',
        name: 'RNWebViewComlink',
    },
    plugins: [nodeResolve(), babel({ babelHelpers: 'bundled' })],
};
