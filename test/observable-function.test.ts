import { assert } from 'chai';
import { ObservableFunction, ApplyEvent } from '../dist/cjs';
import 'rxjs/add/operator/take';

describe('ObservableFunction', () => {
  describe('onApply', () => {

    function func(n: number) {
      return 2 * n;
    }

    it('should emit when the function is called', done => {
      const proxiedFunc = ObservableFunction.create(func);

      proxiedFunc.onApply.take(1).subscribe((e: ApplyEvent) => {
        assert.deepEqual(e.argumentsList, [42]);
        assert.deepEqual(e.result, 84);
        done();
      });

      proxiedFunc(42);
    });

    it('should call the original function as well', done => {
      function func2(n: number) {
        done();
      }

      const proxiedFunc = ObservableFunction.create(func2);
      proxiedFunc(42);
    });

    it('should return the result of the function call', () => {
      const proxiedFunc = ObservableFunction.create(func);
      assert.deepEqual(proxiedFunc(42), 84);
    });
  });
});
