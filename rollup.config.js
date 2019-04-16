import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import json from 'rollup-plugin-json';
import shebang from '@robmarr/rollup-plugin-shebang';

const banner = '/** ViewAR CLI **/';

export default {
  input: 'src/index.js',
  output: {
    banner,
    file: 'dist/index.js',
    format: 'cjs',
    name: 'viewar-cli',
  },
  plugins: [
    shebang(),
    json(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
    minify({
      mangle: { topLevel: true },
    }),
  ],
};
