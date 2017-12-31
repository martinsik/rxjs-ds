# RxJS-DS

[![Build Status](https://travis-ci.org/martinsik/rxjs-ds.svg?branch=master)](https://travis-ci.org/martinsik/rxjs-ds)

A library for creating observable data structures using RxJS 5 and [window.Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects. Works with both RxJS 5.4 and RxJS 5.5 (lettable operators).

## Usage

The intended way of creating proxies is via the `ObservableObject` class.

```typescript
import { ObservableObject } from 'rxjs-ds';

// create an ObservableObject from an empty object `{}` 
const proxied = new ObservableObject();
// The same as: new ObservableObject({});

// Create ObservableObject from an existing object
const obj = { a: 1, b: 2, c: 3 };
const proxied = new ObservableObject(obj);
```

Each `ObservableObject` consists of the proxy object (`proxy` property) and the map of events (`events` property).

```typescript
import { ObservableObject } from 'rxjs-ds';

const proxied = new ObservableObject();
const events = proxied.events;
const proxy = proxied.proxy;

// ... or shorter
const { events, proxy } = new ObservableObject();
``` 

If you pass the optional initializing object with `ObservableObject(object);` the `object` will be used as the storage backend for `window.Proxy`. To properly trigger events we need to perform all operations on the `proxied.proxy` object instead of the original one. 

The underlying proxy doesn't make difference among the backend objects so `ObservableObject` can be used to create observable arrays (or any other objects) as well. By default `ObservableObject` uses `{}` when no `object` is set.

To create an observable array we need to use an array as the initializing object `object`:

```javascript
const proxied = ObservableObject.create([]);
const events = proxied.events;
const array = proxied.proxy as Array<any>;
```

See more examples with arrays bellow.

## API

Observable proxy for wrapping any object. 

```typescript
ObservableObject<T>(object: T = {}, proxyMethods = false)
```

Observable proxy for wrapping functions.

```typescript
ObservableFunction<F extends Function>(fn: F)
```

## Examples

### Object

Observe events when getting an object property:

```typescript
import { ObservableObject, GetEvent } from 'rxjs-ds';

const proxied = new ObservableObject();
const events = proxied.events;
const proxy = proxied.proxy;

events.onGet.subscribe((e: GetEvent) => {
  console.log(e);
});

proxy['a'] = 1;
proxy['b'] = 2;
proxy['c'] = 3;

const _ = proxy['b'];

// prints:
// { property: 'b', value: 2, target: { a: 1, b: 2, c: 3 } }
```

See demos: [demo/ts/demo_01.ts](https://github.com/martinsik/rxjs-ds/blob/master/demo/ts/demo_01.ts) and [demo/demo_01.js](https://github.com/martinsik/rxjs-ds/blob/master/demo/demo_01.js)

Observe events when setting/overriding an object property:

```typescript
import { ObservableObject } from 'rxjs-ds';

const { proxy: object, events } = new ObservableObject();

events.onSet.subscribe(console.log);

object['a'] = 1;
object['b'] = 2;
object['a'] = 42;

// Prints the following:
// { property: 'a', oldValue: undefined, newValue: 1, target: { a: 1 } }
// { property: 'b', oldValue: undefined, newValue: 2, target: { a: 1, b: 2 } }
// { property: 'a', oldValue: 1, newValue: 42, target: { a: 42, b: 2 } }
```

See demo: [demo/demo_02.js](https://github.com/martinsik/rxjs-ds/blob/master/demo/demo_02.js)

Observing changes on an already existing object:

```typescript
import { ObservableObject } from 'rxjs-ds';

const object = {
  'a': 1,
  'b': 2,
  'c': 3,
};

const { proxy: object, events } = new ObservableObject(object);

events.onSet.subscribe(console.log);

// Note that we have to use `proxy` instead of `object`.
// Modifying properties on `object` won't trigger the event.
object['b'] = 42;

// Prints the following:
// { property: 'b', oldValue: 2, newValue: 42, target: { a: 1, b: 42, c: 3 } }
```

See demo: [demo/demo_03.js](https://github.com/martinsik/rxjs-ds/blob/master/demo/demo_03.js)

### Array

Observing array length changes:

```typescript
import { ObservableObject, SetEvent } from 'rxjs-ds';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
// Works with RxJS 5.5 and lettable operators as well

const { proxy: array, events } = new ObservableObject([]);

events.onSet
  .map((e: SetEvent) => e.target.length)
  .distinctUntilChanged()
  .subscribe((length: number) => {
    console.log(length);
  });

array.push('a', 'b', 'c');
array.splice(1, 2); // remove two items

// prints:
// 1
// 2
// 3
// 1
```

### Function

Functions can be proxied as well via the `ObservableFunction` class. The `onApply` event is triggered when invoking the proxied function.

```typescript
import { ObservableFunction, ApplyEvent } from 'rxjs-ds';
import 'rxjs/add/operator/take';

function func(n: number) {
  return 2 * n;
}

const { proxy, events } = new ObservableFunction(func);

events.onApply.take(1).subscribe((e: ApplyEvent) => {
  console.log(e);
});

// We need to invoke the proxied function, not the  
proxy(42);

// Prints the following:
// { thisArg: undefined, argumentsList: [ 42 ], result: 84, target: [Function: func] }
```

See demos: [demo/ts/demo_04.ts](https://github.com/martinsik/rxjs-ds/blob/master/demo/ts/demo_04.ts) and [demo/demo_04.js](https://github.com/martinsik/rxjs-ds/blob/master/demo/demo_04.js)

Observing setters/getters works the same as with objects.
