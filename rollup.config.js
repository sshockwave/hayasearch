// rollup.config.js

import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { emptyDir } from 'rollup-plugin-empty-dir'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

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
    babel({
      ignore: ['node_modules'],
      presets: ["@babel/preset-react"],
    }),
    simpleReloader(),
    resolve(),
    commonjs(),
    emptyDir(),
  ],
}
