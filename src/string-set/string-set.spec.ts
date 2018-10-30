import { StringSet } from './string-set';

describe('StringSet', () => {
  describe('create', () => {

    it ('should create from empty', () => {
      let s: StringSet;

      expect(() => s = StringSet.fromEmpty()).not.toThrow();
      expect(s.isEmpty()).toBeTruthy();
      expect(s.size()).toBe(0);
      expect(s.has('1')).toBeFalsy();


      expect(() => s = s.merge('1')).not.toThrow();
      expect(s.isEmpty()).toBeFalsy();
      expect(s.size()).toBe(1);
      expect(s.has('1')).toBeTruthy();

      expect(() => s = s.merge('1')).not.toThrow();


      expect(() => s = s.add('1')).toThrowError(
        `Could not add '1' to StringSet: Item already exists`
      );
      expect(s.isEmpty()).toBeFalsy();
      expect(s.size()).toBe(1);
      expect(s.has('1')).toBeTruthy();


      expect(() => s = s.add('2')).not.toThrow();
      expect(s.isEmpty()).toBeFalsy();
      expect(s.size()).toBe(2);
      expect(s.has('2')).toBeTruthy();

      expect(() => s = s.remove('2')).not.toThrow();
      expect(s.isEmpty()).toBeFalsy();
      expect(s.size()).toBe(1);
      expect(s.has('2')).toBeFalsy();

      expect(() => s = s.remove('inexistentKey')).toThrowError(
        `Could not remove from StringSet: item 'inexistentKey' does not exist`
      );


      s = s.remove('1');
      expect(s.isEmpty()).toBeTruthy();

      s = s.add('a');
      s = s.add('s');
      s = s.add('e');
      s = s.add('f');

      expect(s.size()).toBe(4);

      expect(() => s = s.filter(i => !!i.match(/(a|e)/))).not.toThrow();
      expect(s.size()).toBe(2);
      expect(s.has('s')).toBeFalsy();
      expect(s.has('f')).toBeFalsy();
      expect(s.has('a')).toBeTruthy();
      expect(s.has('e')).toBeTruthy();

      let o;
      let a;

      expect(() => o = s.toObject()).not.toThrow();
      expect(o).toEqual({
        a: true,
        e: true
      })

      expect(() => a = s.toArray()).not.toThrow();
      expect(a).toContain('a');
      expect(a).toContain('e');
      expect(a.length).toBe(2);

      let c = [];
      s.forEach(i => c.push(i));
      expect(c.sort().join('')).toEqual('ae')

    })
  })
});
