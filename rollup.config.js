
export default {
    input: 'dist/package/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'umd',
        name: 'RxJS_DS'
    },
    external: [
        'rxjs/Subject',
    ],
};
