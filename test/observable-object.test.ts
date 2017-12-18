import { assert } from 'chai';
import { ObservableObject, GetEvent, SetEvent, ApplyEvent } from '../dist/cjs';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/filter';

describe('ObservableObject', () => {

  describe('object', () => {

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

        const _ = proxy['b']; // triggerGetter
      });
    });

    it('should emit when accessing an object property from an existing object', done => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
      };
      const { proxy, events } = ObservableObject.create(obj);

      events.onGet.take(1).subscribe((e: GetEvent) => {
        assert.strictEqual('b', e.property);
        assert.strictEqual(2, e.value);
        done();
      });

      const _ = proxy['b']; // triggerGetter
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
  });

  describe('array', () => {
    describe('onGet', () => {
      it('should emit when accessing an array item', done => {
        const { proxy, events } = ObservableObject.create([]);

        events.onGet.take(1).subscribe((e: GetEvent) => {
          assert.strictEqual('1', e.property);
          assert.strictEqual('b', e.value);
          done();
        });

        // proxy.push('a', 'b', 'c');
        proxy[0] = 'a';
        proxy[1] = 'b';
        proxy[2] = 'c';

        const _ = proxy[1]; // trigger getter
      });
    });

    it('should emit when appending items with the Array.push() method', done => {
      const { proxy, events } = ObservableObject.create([]);
      let counter = 0;

      events.onGet.take(1).subscribe((e: GetEvent) => {
        assert.strictEqual('push', e.property);
        assert.isDefined(e.value);
        assert.strictEqual(0, counter++);
      });

      events.onGet.skip(1).take(1).subscribe((e: GetEvent) => { // called internally
        assert.strictEqual('length', e.property);
        assert.strictEqual(0, e.value);
        assert.strictEqual(1, counter++);
      });

      events.onSet.take(1).subscribe((e: SetEvent) => {
        assert.strictEqual('a', e.newValue);
        assert.strictEqual('0', e.property);
        assert.strictEqual(2, counter++);
      });

      events.onSet.skip(1).take(1).subscribe((e: SetEvent) => {
        assert.strictEqual('b', e.newValue);
        assert.strictEqual('1', e.property);
        assert.strictEqual(3, counter++);
      });

      events.onSet.skip(2).take(1).subscribe((e: SetEvent) => {
        assert.strictEqual('c', e.newValue);
        assert.strictEqual('2', e.property);
        assert.strictEqual(4, counter++);
      });

      events.onGet.skip(2).take(1).subscribe((e: GetEvent) => {
        assert.strictEqual('1', e.property);
        assert.strictEqual('b', e.value);
        assert.strictEqual(5, counter);
        done();
      });

      proxy.push('a', 'b', 'c');

      const _ = proxy[1]; // trigger getter
    });

    describe('onSet', () => {
      it('should emit when setting an item on an array index', done => {
        const { proxy, events } = ObservableObject.create(new Array(5));

        events.onSet.take(1).subscribe((e: SetEvent) => {
          assert.strictEqual('1', e.property);
          assert.isUndefined(e.oldValue);
          assert.strictEqual('b', e.newValue);
          done();
        });

        proxy[1] = 'b'; // trigger setter
      });

      it('should emit when overriding an array index', done => {
        const { proxy, events } = ObservableObject.create([]);

        proxy.push('a', 'b', 'c');

        events.onSet.take(1).subscribe((e: SetEvent) => {
          assert.strictEqual('1', e.property);
          assert.strictEqual('b', e.oldValue);
          assert.strictEqual('d', e.newValue);
          done();
        });

        proxy[1] = 'd'; // trigger setter
      });
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
