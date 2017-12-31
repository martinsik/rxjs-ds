const RxJS_DS = require('../dist/package/bundle/rxjs-ds');
const ObservableObject = RxJS_DS.ObservableObject;

const { proxy, events } = new ObservableObject();

events.onSet.subscribe(console.log);

proxy['a'] = 1;
proxy['b'] = 2;
proxy['a'] = 42;

// Prints the following:
// { property: 'a', oldValue: undefined, newValue: 1, target: { a: 1 } }
// { property: 'b', oldValue: undefined, newValue: 2, target: { a: 1, b: 2 } }
// { property: 'a', oldValue: 1, newValue: 42, target: { a: 42, b: 2 } }
