import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/package/index.js',
  output: {
    file: 'dist/package/bundle/rxjs-observable-object.js',
    format: 'umd',
    name: 'RxJS_OO',
    sourceMap: true,
  },
  external: [
      'rxjs',
  ],
  plugins: [
    commonjs()
  ]
};
