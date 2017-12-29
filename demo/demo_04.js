require('rxjs');
const RxJS_DS = require('../dist/package/bundle/rxjs-ds.bundle');
const ObservableObject = RxJS_DS.ObservableObject;

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
