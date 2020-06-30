import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import shebang from '@robmarr/rollup-plugin-shebang';
import builtins from 'rollup-plugin-node-builtins';

const banner = '/**\n * ViewAR CLI \n * @preserve\n**/';

export default {
  input: 'index.js',
  output: {
    banner,
    file: 'dist/index.js',
    format: 'cjs',
    name: '@viewar/cli',
  },
  plugins: [
    shebang(),
    json(),
    builtins(),
    terser({
      output: {
        comments: function(node, comment) {
          var text = comment.value;
          var type = comment.type;
          if (type == 'comment2') {
            // multiline comment
            return /@preserve|@license|@cc_on/i.test(text);
          }
        },
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
      preferBuiltins: true,
    }),
    commonjs({
      ignore: ['conditional-runtime-dependency'],
    }),
  ],
};
