import { assert } from 'chai';
import { ObservableObject, ObservableFunction, GetEvent, ApplyEvent } from '../dist/cjs';
import 'rxjs/add/operator/take';

describe('ObservableObject', () => {
  describe('onGet', () => {
    it('should emit when accessing an object property', done => {
      const { proxy, events } = ObservableObject.create();

      events.onGet.take(1).subscribe((e: GetEvent) => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.value);
        done();
      });

      proxy['a'] = 1;
      proxy['b'] = 2;
      proxy['c'] = 3;

      const triggerGetter = proxy['b'];
    });
  });

  describe('onSet', () => {
    it('should emit when setting an object property', done => {
      const { proxy, events } = ObservableObject.create();

      events.onSet.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.isUndefined(e.oldValue);
        assert.strictEqual(2, e.newValue);
        done();
      });

      proxy['b'] = 2; // trigger setter
    });

    it('should emit when overriding an object property', done => {
      const { proxy, events } = ObservableObject.create();

      proxy['b'] = 2;

      events.onSet.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.oldValue);
        assert.strictEqual(3, e.newValue);
        done();
      });

      proxy['b'] = 3; // trigger setter
    });
  });

  describe('onDelete', () => {
    it('should emit when an object property is deleted', done => {
      const { proxy, events } = ObservableObject.create();

      proxy['a'] = 1;
      proxy['b'] = 2;
      proxy['c'] = 3;

      events.onDelete.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.value);
        done();
      });

      delete proxy['b'];
    });
  });

  describe('proxyMethods', () => {
    const object = {
      prop: 0,
      multiply: (n: number) => {
        const result = 2 * n;
        this.prop = result;
        return result;
      },
    };

    type MethodType = (n: number) => number;

    it('proxied object methods must be invoked', done => {
      const { proxy, events, methodEvents } = ObservableObject.create(object, true);

      methodEvents.multiply.onApply.take(1).subscribe((e: ApplyEvent) => {
        assert.deepEqual(e.argumentsList, [42]);
        assert.deepEqual(e.result, 84);
        done();
      });

      proxy.multiply(42);
    });

    it('proxied object methods must return correct value', () => {
      const { proxy, events } = ObservableObject.create(object, true);

      assert.strictEqual(84, proxy.multiply(42));
    });

    it('methods are not proxied by default', () => {
      const { proxy, events, methodEvents } = ObservableObject.create(object);

      assert.isUndefined(methodEvents);
      assert.strictEqual(84, proxy.multiply(42));
    });
  });
});
