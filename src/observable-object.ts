import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

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

  static create(obj: any = {}): ObservableObject {
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

      // apply: (target: any, thisArg: any, argumentsList: any[]): void => {
      //   console.log('apply');
      //   onApply.next({ thisArg, argumentsList });
      // }
    });

    proxy.onGet = onGet;
    proxy.onSet = onSet;
    proxy.onDelete = onDelete;
    // proxy.onApply = onApply;

    return proxy;
  }
}
