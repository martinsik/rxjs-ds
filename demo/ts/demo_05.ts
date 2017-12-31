import { ObservableFunction, ApplyEvent } from '../../dist/package';
import 'rxjs/add/operator/take';

function func(n: number) {
  return 2 * n;
}

const { proxy, events } = new ObservableFunction(func);

events.onApply.take(1).subscribe((e: ApplyEvent) => {
  console.log(e);
});

proxy(42);

// Prints the following:
// { thisArg: undefined, argumentsList: [ 42 ], result: 84, target: [Function: func] }
