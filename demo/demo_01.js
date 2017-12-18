const RxJS_DS = require('../dist/package/bundle/rxjs-ds.bundle');
const ObservableObject = RxJS_DS.ObservableObject;

const proxied = ObservableObject.create();
const events = proxied.events;
const object = proxied.proxy;

events.onGet.subscribe(console.log);

object['a'] = 1;
object['b'] = 2;
object['c'] = 3;

const _ = object['b'];

// Prints the following:
// { property: 'b', value: 2 }
