import { assert } from 'chai';
import { ObservableObject, ObservableFunction, ApplyEvent } from '../dist/cjs';
import 'rxjs/add/operator/take';

describe('ObservableObject', () => {
  describe('onGet', () => {
    it('should emit when accessing an object property', done => {
      const o = ObservableObject.create();

      o.onGet.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.value);
        done();
      });

      o['a'] = 1;
      o['b'] = 2;
      o['c'] = 3;

      const triggerGetter = o['b'];
    });
  });

  describe('onSet', () => {
    it('should emit when setting an object property', done => {
      const o = ObservableObject.create();

      o.onSet.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.isUndefined(e.oldValue);
        assert.strictEqual(2, e.newValue);
        done();
      });

      o['b'] = 2; // trigger setter
    });

    it('should emit when overriding an object property', done => {
      const o = ObservableObject.create();

      o['b'] = 2;

      o.onSet.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.oldValue);
        assert.strictEqual(3, e.newValue);
        done();
      });

      o['b'] = 3; // trigger setter
    });
  });

  describe('onDelete', () => {
    it('should emit when an object property is deleted', done => {
      const o = ObservableObject.create();

      o['a'] = 1;
      o['b'] = 2;
      o['c'] = 3;

      o.onDelete.take(1).subscribe(e => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.value);
        done();
      });

      delete o['b'];
    });
  });

  describe('proxyMethods', () => {
    const object = {
      prop: 0,
      method: (n: number) => {
        const result = 2 * n;
        this.prop = result;
        return result;
      },
    };

    it('proxied object methods must be invoked', done => {
      const o = ObservableObject.create(object, true);

      o.method.onApply.take(1).subscribe((e: ApplyEvent) => {
        assert.deepEqual(e.argumentsList, [42]);
        assert.deepEqual(e.result, 84);
        done();
      });

      o.method(42);
    });

    it('proxied object methods must return correct value', () => {
      const o = ObservableObject.create(object, true);

      assert.strictEqual(84, o.method(42));
    });

    it('methods are not by default proxied', () => {
      const o = ObservableObject.create(object);

      console.log(o);

      assert.isUndefined(o.method.onApply);
      assert.strictEqual(84, o.method(42));
    });
  });
});
