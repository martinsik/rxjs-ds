import { assert } from 'chai';
import { ObservableObject } from '../dist/cjs';
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

  // describe('onApply', () => {
  //   it('should emit when an object method is called', done => {
  //     const object = {
  //       prop: 0,
  //       method: (arg: number) => {
  //         this.prop = 1;
  //       },
  //     };
  //     const o = ObservableObject.create();
  //
  //     o.onApply.take(1).subscribe(e => {
  //       assert.strictEqual(object.prop, 1);
  //       assert.deepEqual(e.argumentsList, [42]);
  //
  //       done();
  //     });
  //
  //     object.method(42);
  //   });
  // });
});
