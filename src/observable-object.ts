import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ObservableFunction, ObservableFunctionEvents, ApplyEvent } from './observable-function';

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

export interface ObservableObjectEvents extends ObservableFunctionEvents {
  onGet: Observable<GetEvent>;
  onSet: Observable<SetEvent>;
  onDelete: Observable<DeleteEvent>;
}

export class ObservableObject<T> {

  public readonly proxy: T;
  public readonly events: ObservableObjectEvents;

  constructor(object: T = {} as any, wrapProxiableProperties = true, parentEvents?: ObservableObjectEvents) {
    let onGet: Subject<GetEvent>;
    let onSet: Subject<SetEvent>;
    let onDelete: Subject<DeleteEvent>;
    let onApply: Subject<ApplyEvent>;

    if (parentEvents) {
      ({ onGet, onSet, onDelete } = parentEvents as any);
    } else {
      onGet = new Subject<GetEvent>();
      onSet = new Subject<SetEvent>();
      onDelete = new Subject<DeleteEvent>();
      onApply = new Subject<ApplyEvent>();
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
      onApply,
    };

    if (wrapProxiableProperties) {
      for (let propertyName of Object.keys(object)) {
        const property = (object as any)[propertyName];

        if (typeof property === 'object') { // Wrap nested objects
          const nestedProxy = new ObservableObject(property, true, parentEvents ? parentEvents : this.events);
          proxy[propertyName] = nestedProxy.proxy;
        } else if (typeof property === 'function') { // Wrap nested functions
          const { proxy: proxyFunc } = new ObservableFunction(property, parentEvents ? parentEvents : this.events);
          proxy[propertyName] = proxyFunc;
        }
      }
    }

    this.proxy = proxy;
  }
}
