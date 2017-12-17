import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// https://github.com/Microsoft/TypeScript/issues/9366

export interface ApplyEvent {
  thisArg: any;
  argumentsList: any[];
  result: any;
}


export interface ObservableFunctionEvents {
  onApply: Observable<ApplyEvent>;
}

export class ObservableFunction<T> {

  constructor(public readonly proxy: T, public readonly events: ObservableFunctionEvents) { }

  static create<F extends Function>(fn: F): ObservableFunction<F> {
    const onApply = new Subject<ApplyEvent>();

    const proxy = new Proxy(fn, {
      apply: (target: any, thisArg: any, argumentsList: any[]): void => {
        const result = target.apply(thisArg, argumentsList);
        onApply.next({ thisArg, argumentsList, result });
        return result;
      }
    });

    const events: ObservableFunctionEvents = {
      onApply,
    };

    return new ObservableFunction(proxy, events);
  }
}
