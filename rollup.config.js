import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import {
  eslint
} from 'rollup-plugin-eslint';
import 'core-js/proposals/string-replace-all';

const path = require('path');

module.exports = {
  input: 'static/script.js',
  plugins: [
    eslint({
      exclude: [
        'src/styles/**',
        'static/*.scss'
      ]
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      sourceMaps: true,
      inputSourceMap: true,
      "presets": [
        [
          "@babel/preset-env", {
            "corejs": 3,
            "useBuiltIns": "entry",
            "targets": "> 0.25%, not dead"
          }
        ]
      ],
      "plugins": ["@babel/plugin-transform-runtime"],
      runtimeHelpers: true
    }),
    resolve(),
    postcss({
      plugins: []
    }),
    commonjs({}),
  ],
  output: {
    file: 'static/bundle.js',
    format: 'iife',
    globals: {
      'mapbox-gl': 'mapboxgl',
    }
  }
};
