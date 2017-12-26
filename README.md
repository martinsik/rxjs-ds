# RxJS-DS

[![Build Status](https://travis-ci.org/martinsik/rxjs-ds.svg?branch=master)](https://travis-ci.org/martinsik/rxjs-ds)

A library for creating observable data structures using RxJS 5 and [window.Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects.

## Usage

The intended way of creating proxies is via the static `ObservableObject.create` method.

```javascript
// create an ObservableObject from an empty object `{}` 
const proxied = ObservableObject.create();
// The same as using: ObservableObject.create({});

const obj = { a: 1, b: 2, c: 3 };
// Create ObservableObject from an existing object
const proxied = ObservableObject.create(obj);
```

Each `ObservableObject` consists of the proxy object (`proxy` property) and a map of events (`events` property).

```javascript
const proxied = ObservableObject.create();
const events = proxied.events;
const proxy = proxied.proxy;

// ... or shorter
const { events, proxy } = ObservableObject.create();
``` 

If you pass the optional initialized object with `ObservableObject.create(obj);` the `obj` stays unchanged and is used as a storage bacekend for `window.Proxy`. To properly trigger events you need to perform all operations on the `proxied.proxy` object instead of the original one. 

## API

```typescript
ObservableObject.create<T extends object>(obj?: T, proxyMethods = false): ObservableObject<T>)
```

## Examples

Observe events when accessing an object property.

```javascript
const proxied = ObservableObject.create();
const events = proxied.events;
const object = proxied.proxy;

events.onGet.subscribe(console.log);

proxy['a'] = 1;
proxy['b'] = 2;
proxy['c'] = 3;

const _ = proxy['b'];
// prints:
// { property: 'b', value: 2 }
```

Observe events when setting/overriding an object property.


