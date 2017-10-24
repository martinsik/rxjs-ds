import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// https://github.com/Microsoft/TypeScript/issues/10853
// https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class

export interface GetEvent {
  property: string;
  target: ObservableObject;
  value: any;
}

export class ObservableObject {

  [key: string]: any;

  onGet: Observable<GetEvent>;

  static create(): ObservableObject {
    const onGet = new Subject<GetEvent>();

    const proxy = new Proxy(new ObservableObject(), {
      get: (target: ObservableObject, property: string) => {
        const value = target[property];
        onGet.next({property, target, value});
        return value;
      }
    });

    proxy.onGet = onGet;

    return proxy;
  }
}
