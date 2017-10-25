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

export class ObservableObject {

  [key: string]: any;
  [key: number]: any;

  onGet: Observable<GetEvent>;
  onSet: Observable<SetEvent>;
  onKeysChanged: Observable<GetEvent>;

  static create(): ObservableObject {
    const onGet = new Subject<GetEvent>();
    const onSet = new Subject<SetEvent>();

    const proxy = new Proxy({}, {
      get: (target: any, property: PropertyKey, receiver?: any) => {
        const value = target[property];

        onGet.next({property, value});
        return value;
      },
      set: (target: any, property: PropertyKey, newValue: any, receiver?: any) => {
        const oldValue = target[property];
        target[property] = newValue;

        onSet.next({property, oldValue, newValue});
        return true;
      },
    });

    proxy.onGet = onGet;
    proxy.onSet = onSet;

    return proxy;
  }
}
