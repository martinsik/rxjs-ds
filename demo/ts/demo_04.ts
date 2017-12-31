import { ObservableObject, SetEvent } from '../../dist/package';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

const { proxy: array, events } = new ObservableObject([]);

events.onSet
  .map((e: SetEvent) => e.target.length)
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
