/**
 * Monitoring nested object getters/setters
 */
require('rxjs');
const RxJS_OO = require('../dist/package/bundle/rxjs-observable-object');
const ObservableObject = RxJS_OO.ObservableObject;

const obj = {
  prop1: 1,
  prop2: 'a',
  other: {
    prop3: 2,
    prop4: 'b',
    another: {
      prop5: 42,
    }
  }
};

const { proxy, events } = new ObservableObject(obj);

events.onGet.subscribe(e => console.log('get', e.property, ':', typeof e.value === 'object' ? 'object' : e.value));
events.onSet.subscribe(e => console.log('set', e.property, ':', e.oldValue, '=>', e.newValue));

proxy.other.another.prop5;

proxy.prop1 = 3;

proxy.other.prop4 = 'c';

// Prints the following:
// get other : object
// get another : object
// get prop5 : 42

// set prop1 : 1 => 3

// get other : object
// set prop4 : b => c
