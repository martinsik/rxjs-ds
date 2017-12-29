const RxJS_DS = require('../dist/package/bundle/rxjs-ds.bundle');
const ObservableObject = RxJS_DS.ObservableObject;

const object = {
  'a': 1,
  'b': 2,
  'c': 3,
};

const { proxy, events } = new ObservableObject(object);

events.onSet.subscribe(console.log);

// Note that we have to use `proxy` instead of `object`.
// Modifying properties on `object` won't trigger the event.
proxy['b'] = 42;

// Prints the following:
// { property: 'b', oldValue: 2, newValue: 42, target: { a: 1, b: 42, c: 3 } }
