
export default {
    input: 'dist/package/index.js',
    output: {
        file: 'dist/package/bundle/rxjs-ds.bundle.js',
        format: 'umd',
        name: 'RxJS_DS'
    },
    external: [
        'rxjs',
    ],
};
