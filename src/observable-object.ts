import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ObservableFunction, ObservableFunctionEvents } from './observable-function';

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

export interface ObservableObjectEvents {
  onGet: Observable<GetEvent>;
  onSet: Observable<SetEvent>;
  onDelete: Observable<DeleteEvent>;
}

export interface ObservableObjectMethodEvents {
  [key: string]: ObservableFunctionEvents;
}

export class ObservableObject<T> {

  constructor(
    public readonly proxy: T,
    public readonly events: ObservableObjectEvents,
    public readonly methodEvents?: ObservableObjectMethodEvents,
  ) { }

  static create<T extends object>(obj?: T, proxyMethods = false): ObservableObject<T> {
    const onGet = new Subject<GetEvent>();
    const onSet = new Subject<SetEvent>();
    const onDelete = new Subject<DeleteEvent>();

    if (typeof obj === 'undefined') {
      obj = {} as any;
    }

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

    let methodEvents;
    if (proxyMethods) {
      methodEvents = wrapMethods(obj, proxy);
    }

    const events: ObservableObjectEvents = {
      onGet,
      onSet,
      onDelete,
    };

    return new ObservableObject(proxy, events, methodEvents);
  }
}

function wrapMethods(obj: any, proxy: any): ObservableObjectMethodEvents {
  const methods: ObservableObjectMethodEvents = {};

  for (const prop in obj) {
    if (typeof obj[prop] === 'function') {
      const func = obj[prop];
      const proxiedMethod = ObservableFunction.create(func);

      proxy[prop] = proxiedMethod.proxy;
      methods[prop] = proxiedMethod.events;
    }
  }

  return methods;
}
