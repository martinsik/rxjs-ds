/**
 * Monitoring function calls
 */
require('rxjs');
const RxJS_OO = require('../dist/package/bundle/rxjs-observable-object');
const ObservableFunction = RxJS_OO.ObservableFunction;

function func(n) {
  return 2 * n;
}

const { proxy, events } = new ObservableFunction(func);

events.onApply.take(1).subscribe(e => {
  console.log(e);
});

proxy(42);

// Prints the following:
// { thisArg: undefined, argumentsList: [ 42 ], result: 84, target: [Function: func] }
