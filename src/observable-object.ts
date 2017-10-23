import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// https://github.com/Microsoft/TypeScript/issues/10853
// https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class

export type ProxiedObject = { [key: string]: any };

export interface GetEvent {
  property: string;
  target: ProxiedObject;
}

export class ObservableObject {

  private _onGet = new Subject<GetEvent>();
  private _onSet = new Subject();
  private _onKeysChanged = new Subject();

  constructor() {
    super({}, {
      get: (target: ProxiedObject, property: string) => {
        this._onGet.next({ property, target });

        return target[property];
      }
    });
  }

  get onGet(): Observable<GetEvent> {
    return this._onGet;
  }

}
