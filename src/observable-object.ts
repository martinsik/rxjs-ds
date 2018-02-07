import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ObservableFunction, ObservableFunctionEvents } from './observable-function';

// https://github.com/Microsoft/TypeScript/issues/10853
// https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class

declare const Proxy: any;
export type PropertyKey = string;

export interface ProxyEvent {
  property: PropertyKey;
  target: any;
}

export interface GetEvent extends ProxyEvent {
  value: any;
}

export interface SetEvent extends ProxyEvent {
  property: PropertyKey;
  oldValue: any;
  newValue: any;
}

export interface DeleteEvent extends ProxyEvent {
  property: PropertyKey;
  value: any;
}

export interface ObservableObjectEvents {
  onGet: Subject<GetEvent>;
  onSet: Subject<SetEvent>;
  onDelete: Subject<DeleteEvent>;
}

export interface ObservableObjectPropertyEvents {
  [key: string]: ObservableFunctionEvents;
}

export class ObservableObject<T> {

  public readonly proxy: T;
  public readonly events: ObservableObjectEvents;
  // public readonly propertyEvents?: ObservableObjectPropertyEvents;

  constructor(object: T = {} as any, wrapProxiableProperties = true, parentEvents?: ObservableObjectEvents) {
    let onGet: Subject<GetEvent>;
    let onSet: Subject<SetEvent>;
    let onDelete: Subject<DeleteEvent>;

    if (parentEvents) {
      ({ onGet, onSet, onDelete } = parentEvents);
    } else {
      onGet = new Subject<GetEvent>();
      onSet = new Subject<SetEvent>();
      onDelete = new Subject<DeleteEvent>();
    }

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

    this.events = {
      onGet,
      onSet,
      onDelete,
    };

    let methodEvents;
    if (wrapProxiableProperties) {
      const o = object as any;
      const nestedObjects = Object.keys(o).filter(property => typeof o[property] === 'object');
      for (let property of nestedObjects) {
        const nestedProxy = new ObservableObject(o[property], true, parentEvents ? parentEvents : this.events);
        proxy[property] = nestedProxy.proxy;
      }

      // this.propertyEvents = wrapProperties(object, proxy);
    }

    this.proxy = proxy;
  }
}

// function wrapProperties(obj: any, proxy: any): ObservableObjectPropertyEvents {
//   const methods: ObservableObjectPropertyEvents = {};
//
//   for (const prop in obj) {
//     if (typeof obj[prop] === 'function') {
//       const func = obj[prop];
//       const proxiedMethod = new ObservableFunction(func);
//
//       proxy[prop] = proxiedMethod.proxy;
//       methods[prop] = proxiedMethod.events;
//     }
//   }
//
//   return methods;
// }
