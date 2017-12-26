# RxJS-DS

[![Build Status](https://travis-ci.org/martinsik/rxjs-ds.svg?branch=master)](https://travis-ci.org/martinsik/rxjs-ds)

A library for creating observable data structures using RxJS 5 and [window.Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects.

## Usage

The intended way of creating proxies is via the static `ObservableObject.create` method.

```javascript
// create an ObservableObject from an empty object `{}` 
const proxied = ObservableObject.create();
// The same as: ObservableObject.create({});

const obj = { a: 1, b: 2, c: 3 };
// Create ObservableObject from an existing object
const proxied = ObservableObject.create(obj);
```

Each `ObservableObject` consists of the proxy object (`proxy` property) and the map of events (`events` property).

```javascript
const proxied = ObservableObject.create();
const events = proxied.events;
const proxy = proxied.proxy;

// ... or shorter
const { events, proxy } = ObservableObject.create();
``` 

If you pass the optional initializing object with `ObservableObject.create(obj);` the `obj` will be used as the storage backend for `window.Proxy`. To properly trigger events you need to perform all operations on the `proxied.proxy` object instead of the original one. 

The underlying Proxy object doesn't make difference among the backend object so `ObservableObject` is used to create observable arrays (or any other objects) as well. By default `ObservableObject` uses `{}` when no `obj` is not set.

To create an observable array we need to use an array as the initializing object `obj`:

```javascript
const proxied = ObservableObject.create([]);
const events = proxied.events;
const proxy = proxied.proxy as Array<any>;
```

See more examples with arrays bellow.

## API

```typescript
ObservableObject.create<T extends object>(obj?: T, proxyMethods = false): ObservableObject<T>)
```

## Examples

### Object

Observe events when getting an object property:

```typescript
const proxied = ObservableObject.create();
const events = proxied.events;
const object = proxied.proxy;

events.onGet
  .subscribe((e: GetEvent) => {
    console.log(e);
  });

proxy['a'] = 1;
proxy['b'] = 2;
proxy['c'] = 3;

const _ = proxy['b'];
// prints:
// { property: 'b', value: 2 }
```

Observe events when setting/overriding an object property.

### Array

Observing array length:

```typescript
const array: string[] = [];
const { proxy, events } = ObservableObject.create(array);

events.onSet
  .map((e: SetEvent) => e.target.length)
  .distinctUntilChanged()
  .subscribe((length: number) => {
    console.log(length);
  });

proxy.push('a', 'b', 'c');
proxy.splice(1, 2); // remove one item
```

Observing setters/getters works the same as with objects.
