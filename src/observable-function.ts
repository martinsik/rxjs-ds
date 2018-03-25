import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// https://github.com/Microsoft/TypeScript/issues/9366

export interface ApplyEvent {
  thisArg: any;
  argumentsList: any[];
  result: any;
  target: any;
}

export interface ObservableFunctionEvents {
  onApply: Observable<ApplyEvent>;
}

export class ObservableFunction<F extends Function> {

  public readonly proxy: F;
  public readonly events: ObservableFunctionEvents;

  constructor(fn: F, parentEvents?: ObservableFunctionEvents) {
    let onApply: Subject<ApplyEvent>;

    if (parentEvents) {
      onApply = parentEvents.onApply as Subject<ApplyEvent>;
    } else {
      onApply = new Subject<ApplyEvent>();
    }

    this.proxy = new Proxy(fn, {
      apply: (target: any, thisArg: any, argumentsList: any[]): void => {
        const result = target.apply(thisArg, argumentsList);
        onApply.next({ thisArg, argumentsList, result, target });
        return result;
      }
    });

    this.events = {
      onApply,
    };
  }
}
