const Rx = require('rxjs');
const RxJS_DS = require('../dist/package/bundle/rxjs-ds.bundle');
const ObservableObject = RxJS_DS.ObservableObject;

const { proxy, events } = ObservableObject.create();

events.onGet.take(1).subscribe(console.log);

proxy['a'] = 1;
proxy['b'] = 2;
proxy['c'] = 3;

const _ = proxy['b'];

// Prints the following:
// { property: 'b', value: 2 }
