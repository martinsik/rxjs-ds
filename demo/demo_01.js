const RxJS_DS = require('../dist/package/bundle/rxjs-ds');
const ObservableObject = RxJS_DS.ObservableObject;

const proxied = new ObservableObject();
const events = proxied.events;
const object = proxied.proxy;

proxied.events.onGet.subscribe(console.log);

object['a'] = 1;
object['b'] = 2;
object['c'] = 3;

const _ = object['b'];

// Prints the following:
// { property: 'b', value: 2, target: { a: 1, b: 2, c: 3 } }
