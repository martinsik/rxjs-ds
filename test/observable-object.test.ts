import { assert } from 'chai';
import { ObservableObject, GetEvent } from '../dist/cjs';
import 'rxjs/add/operator/take';

describe('ObservableObject', () => {
  describe('onGet', () => {
    it('should emit when accessing an object property', done => {
      const o = new ObservableObject();

      o.onGet.take(1).subscribe(e => {
        assert.equal('b', e.property);
        done();
      });

      o['a'] = 1;
      o['b'] = 2;
      o['c'] = 3;

      const expected = o['b'];
      assert.equal(expected, 2);
    });
  });
});
