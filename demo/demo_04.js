/**
 * Monitoring array length
 */
require('rxjs');
const RxJS_OO = require('../dist/package/bundle/rxjs-observable-object');
const ObservableObject = RxJS_OO.ObservableObject;

const { proxy: array, events } = new ObservableObject([]);

events.onSet
  .map(e => e.target.length)
  .distinctUntilChanged()
  .subscribe(length => {
    console.log(length);
  });

array.push('a', 'b', 'c');
array.splice(1, 2); // remove two items

// Prints the following:
// 1
// 2
// 3
// 1
