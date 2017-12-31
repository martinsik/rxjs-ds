import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/package/index.js',
  output: {
      file: 'dist/package/bundle/rxjs-ds.js',
      format: 'umd',
      name: 'RxJS_DS'
  },
  external: [
      'rxjs',
  ],
  plugins: [
    commonjs()
  ]
};
