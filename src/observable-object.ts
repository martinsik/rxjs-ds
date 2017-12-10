import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ObservableFunction } from './observable-function';

// https://github.com/Microsoft/TypeScript/issues/10853
// https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class

export interface GetEvent {
  property: PropertyKey;
  value: any;
}

export interface SetEvent {
  property: PropertyKey;
  oldValue: any;
  newValue: any;
}

export interface DeleteEvent {
  property: PropertyKey;
  value: any;
}

export class ObservableObject {

  [key: string]: any;
  [key: number]: any;

  onGet: Observable<GetEvent>;
  onSet: Observable<SetEvent>;
  onKeysChanged: Observable<GetEvent>;
  onDelete: Observable<DeleteEvent>;

  static create(obj: any = {}, proxyMethods = false): ObservableObject {
    const onGet = new Subject<GetEvent>();
    const onSet = new Subject<SetEvent>();
    const onDelete = new Subject<DeleteEvent>();

    const proxy = new Proxy(obj, {
      get: (target: any, property: PropertyKey, receiver?: any) => {
        const value = target[property];

        onGet.next({property, value});
        return value;
      },

      set: (target: any, property: PropertyKey, newValue: any, receiver?: any): boolean => {
        const oldValue = target[property];
        target[property] = newValue;

        onSet.next({property, oldValue, newValue});
        return true;
      },

      deleteProperty: (target: any, property: PropertyKey): boolean => {
        const value = target[property];
        const ret = delete target[property];

        onDelete.next({property, value});
        return ret;
      },
    });

    if (proxyMethods) {
      wrapMethods(obj, proxy);
    }

    Object.defineProperty(proxy, 'onGet', {
      value: onGet,
    });

    // proxy.onGet = onGet;
    proxy.onSet = onSet;
    proxy.onDelete = onDelete;

    return proxy;
  }
}

function wrapMethods(obj: any, proxy: any): void {
  for (const prop in obj) {
    if (typeof obj[prop] === 'function') {
      const func = obj[prop];
      proxy[prop] = ObservableFunction.create(func);
    }
  }
}
