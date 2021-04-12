import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

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
    ],
};
