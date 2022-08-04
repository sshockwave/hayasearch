// rollup.config.js

import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { emptyDir } from 'rollup-plugin-empty-dir'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { terser } from "rollup-plugin-terser";
import scss from 'rollup-plugin-scss'

export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    // always put chromeExtension() before other plugins
    chromeExtension(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    scss(),
    babel({
      babelHelpers: 'runtime',
      ignore: ['node_modules'],
      presets: ["@babel/preset-react"],
      plugins: ["@babel/plugin-transform-runtime"],
    }),
    simpleReloader(),
    resolve(),
    commonjs(),
    emptyDir(),
    terser(),
  ],
}
