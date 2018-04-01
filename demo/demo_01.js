const RxJS_OO = require('../dist/package/bundle/rxjs-observable-object');
const ObservableObject = RxJS_OO.ObservableObject;

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
