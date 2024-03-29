import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import { replaceScript } from './rollup-plugin-replace-script';

export default {
    input: 'lib/web/web.js',
    output: {
        file: 'lib/web/web.bundle.js',
        format: 'iife',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({ babelHelpers: 'runtime' }),
        cleanup({
            comments: 'none',
        }),
        terser(),
        replaceScript(),
    ],
};
