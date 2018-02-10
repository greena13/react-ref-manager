import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: process.env.NODE_ENV === 'production' ? 'cjs/react-ref-manager.production.min.js' : 'cjs/react-ref-manager.development.js',
    exports: 'named'
  },
  external: [ 'react-dom' ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),

    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),

    (process.env.NODE_ENV === 'production' && uglify())
  ]
};
