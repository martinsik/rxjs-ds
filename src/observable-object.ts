import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ObservableFunction, ObservableFunctionEvents } from './observable-function';

// https://github.com/Microsoft/TypeScript/issues/10853
// https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class

export interface GetEvent {
  property: PropertyKey;
  value: any;
  target: any;
}

export interface SetEvent {
  property: PropertyKey;
  oldValue: any;
  newValue: any;
  target: any;
}

export interface DeleteEvent {
  property: PropertyKey;
  value: any;
  target: any;
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

  public readonly proxy: T;
  public readonly events: ObservableObjectEvents;
  public readonly methodEvents?: ObservableObjectMethodEvents;

  constructor(object: T = {} as any, proxyMethods = false) {
    const onGet = new Subject<GetEvent>();
    const onSet = new Subject<SetEvent>();
    const onDelete = new Subject<DeleteEvent>();

    const proxy = new Proxy(object, {
      get: (target: any, property: PropertyKey, receiver?: any) => {
        const value = target[property];

        onGet.next({property, value, target});
        return value;
      },

      set: (target: any, property: PropertyKey, newValue: any, receiver?: any): boolean => {
        const oldValue = target[property];
        target[property] = newValue;

        onSet.next({property, oldValue, newValue, target});
        return true;
      },

      deleteProperty: (target: any, property: PropertyKey): boolean => {
        const value = target[property];
        const ret = delete target[property];

        onDelete.next({property, value, target});
        return ret;
      },
    });

    let methodEvents;
    if (proxyMethods) {
      this.methodEvents = wrapMethods(object, proxy);
    }

    this.events = {
      onGet,
      onSet,
      onDelete,
    };

    this.proxy = proxy;
  }
}

function wrapMethods(obj: any, proxy: any): ObservableObjectMethodEvents {
  const methods: ObservableObjectMethodEvents = {};

  for (const prop in obj) {
    if (typeof obj[prop] === 'function') {
      const func = obj[prop];
      const proxiedMethod = new ObservableFunction(func);

      proxy[prop] = proxiedMethod.proxy;
      methods[prop] = proxiedMethod.events;
    }
  }

  return methods;
}
