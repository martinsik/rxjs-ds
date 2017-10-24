import { assert } from 'chai';
import { ObservableObject } from '../dist/cjs';
import 'rxjs/add/operator/take';

describe('ObservableObject', () => {
  describe('onGet', () => {
    it('should emit when accessing an object property', done => {
      const o = ObservableObject.create();

      assert.exists(o.onGet);

      o.onGet.take(1).subscribe(e => {
        assert.equal('b', e.property);
        assert.equal(2, e.value);
        done();
      });

      o['a'] = 1;
      o['b'] = 2;
      o['c'] = 3;

      const triggerGetter = o['b'];
    });
  });
});
