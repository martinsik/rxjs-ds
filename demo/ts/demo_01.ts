import { ObservableObject, GetEvent } from '../../dist/package';

const proxied = new ObservableObject();
const events = proxied.events;
const object = proxied.proxy as {[key: string]: any};

proxied.events.onGet.subscribe((e: GetEvent) => {
  console.log(e);
});

object['a'] = 1;
object['b'] = 2;
object['c'] = 3;

const _ = object['b'];

// Prints the following:
// { property: 'b', value: 2, target: { a: 1, b: 2, c: 3 } }
