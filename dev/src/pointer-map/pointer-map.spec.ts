import { PointerMap } from "./pointer-map";

describe('PointerMap', () => {
  describe('create', () => {
    it('should create from object', () => {
      let pointerMap;
      expect(() => {
        pointerMap = PointerMap.fromObject({
        })
      }).not.toThrow()
      expect(pointerMap.size()).toBe(0);

      expect(() => {
        pointerMap = PointerMap.fromObject({
          'abc': 'def'
        })
      }).not.toThrow()
      expect(pointerMap.size()).toBe(1);

      expect(() => {
        pointerMap = PointerMap.fromObject({
          'abc': 'def',
          'ghi': 'jkl'
        })
      }).not.toThrow()
      expect(pointerMap.size()).toBe(2);
    })

    it('should create from array pairs', () => {
      let pointerMap;
      expect(() => {
        pointerMap = PointerMap.fromPairs([])
      }).not.toThrow()
      expect(pointerMap.size()).toBe(0);

      expect(() => {
        pointerMap = PointerMap.fromPairs([
          ['abc', 'def'],
          ['abc', 'fgh']
        ])
      }).toThrowError(`Could not create PointerMap: Pairs contain duplicate key 'abc'`);

      expect(() => {
        pointerMap = PointerMap.fromPairs([['abc', 'def']])
      }).not.toThrow()
      expect(pointerMap.size()).toBe(1);

      expect(() => {
        pointerMap = PointerMap.fromPairs([
          ['abc', 'def'],
          ['ghi', 'jkl']
        ])
      }).not.toThrow()
      expect(pointerMap.size()).toBe(2);
    })

    it('should have has method', () => {
      let pointerMap, hasIt;
      pointerMap = PointerMap.fromPairs([])
      expect(() => {
        hasIt = pointerMap.has('abc')
      }).not.toThrow()
      expect(hasIt).toBeFalsy()

      pointerMap = PointerMap.fromObject({})
      expect(() => {
        hasIt = pointerMap.has('abc')
      }).not.toThrow()
      expect(hasIt).toBeFalsy()

      pointerMap = PointerMap.fromPairs([['abc', 'def']])
      expect(() => {
        hasIt = pointerMap.has('abc')
      }).not.toThrow()
      expect(hasIt).toBeTruthy()
      expect(() => {
        hasIt = pointerMap.has('abc', 'def')
      }).not.toThrow()
      expect(hasIt).toBeTruthy()
      expect(() => {
        hasIt = pointerMap.has('abc', '12345')
      }).not.toThrow()
      expect(hasIt).toBeFalsy()


      pointerMap = PointerMap.fromObject({'abc': 'def'})
      expect(() => {
        hasIt = pointerMap.has('abc')
      }).not.toThrow()
      expect(hasIt).toBeTruthy()
      expect(() => {
        hasIt = pointerMap.has('abc', 'def')
      }).not.toThrow()
      expect(hasIt).toBeTruthy()
      expect(() => {
        hasIt = pointerMap.has('abc', '12345')
      }).not.toThrow()
      expect(hasIt).toBeFalsy()

    })

    it('should add key and value', () => {
      let pointerMap;
      pointerMap = PointerMap.fromObject({'abc': 'def'});
      expect(() => {
        pointerMap = pointerMap.add('abc', 'def')
      }).toThrowError(`Could not add to PointerMap: key 'abc' already exists`)

      pointerMap = PointerMap.fromObject({});
      expect(() => {
        pointerMap = pointerMap.add('abc', 'def')
      }).not.toThrow()
      expect(pointerMap.size()).toBe(1);
      expect(pointerMap.has('abc')).toBeTruthy()
      expect(pointerMap.has('abc', 'def')).toBeTruthy()

      pointerMap = PointerMap.fromObject({'abc': 'def'});
      expect(() => {
        pointerMap = pointerMap.add('fgh', 'ijk')
      }).not.toThrow()
      expect(pointerMap.size()).toBe(2);
      expect(pointerMap.has('abc')).toBeTruthy()
      expect(pointerMap.has('abc', 'def')).toBeTruthy()
      expect(pointerMap.has('fgh')).toBeTruthy()
      expect(pointerMap.has('fgh', 'ijk')).toBeTruthy()

      pointerMap = PointerMap.fromObject({});
      expect(() => pointerMap = pointerMap.add('test')).not.toThrow()
      expect(pointerMap.get('test')).toEqual(true);
      expect(pointerMap.toObject()).toEqual({
        'test': true
      })

    })

    it('should set key and value', () => {
      let pointerMap;
      pointerMap = PointerMap.fromObject({});
      expect(() => {
        pointerMap = pointerMap.set('abc', 'def')
      }).not.toThrow()
      expect(pointerMap.size()).toBe(1);
      expect(pointerMap.has('abc')).toBeTruthy()
      expect(pointerMap.has('abc', 'def')).toBeTruthy()


      pointerMap = PointerMap.fromObject({'abc': 'def'});
      expect(() => {
        pointerMap = pointerMap.set('abc', 'def')
      }).not.toThrow()
      expect(pointerMap.size()).toBe(1);
      expect(pointerMap.has('abc')).toBeTruthy()
      expect(pointerMap.has('abc', 'def')).toBeTruthy()
    })

    it('should remove key', () => {
      let pointerMap;
      pointerMap = PointerMap.fromObject({'abc': 'def'});
      expect(() => {
        pointerMap = pointerMap.remove('abc')
      }).not.toThrow()
      expect(pointerMap.size()).toBe(0);
      expect(pointerMap.has('abc')).toBeFalsy()
      expect(pointerMap.has('abc', 'def')).toBeFalsy()

      pointerMap = PointerMap.fromObject({'y': 'z'});
      expect(() => {
        pointerMap = pointerMap.remove('abc')
      }).toThrowError(`Could not remove from PointerMap: key 'abc' does not exist`)
      expect(pointerMap.size()).toBe(1);
      expect(pointerMap.has('abc')).toBeFalsy()
      expect(pointerMap.has('abc', 'def')).toBeFalsy()
      expect(pointerMap.has('y')).toBeTruthy()
      expect(pointerMap.has('y', 'abc')).toBeFalsy()
      expect(pointerMap.has('y', 'z')).toBeTruthy()
    })
  })

  describe('get', () => {
    it('should get key from pointerMap', () => {
      let pointerMap, result;
      pointerMap = PointerMap.fromObject({'y': 'z'});
      expect(() => {
        result = pointerMap.get('abc')
      }).toThrowError(`Could not get from PointerMap: key 'abc' does not exist`)
      expect(() => {
        result = pointerMap.get('y')
      }).not.toThrow()
      expect(result).toEqual('z');
    })
  })

  describe('toObject', () => {
    it('should convert to object', () => {
      const initialObj = {
        'a': 'b',
        'c': 'd'
      }
      let pointerMap, result;
      pointerMap = PointerMap.fromObject(initialObj)
      expect(() => {
        result = pointerMap.toObject()
      }).not.toThrow();
      expect(result).toEqual(initialObj)
      pointerMap = pointerMap.remove('c');
      expect(() => {
        result = pointerMap.toObject()
      }).not.toThrow();
      expect(result).toEqual({'a': 'b'})
    })
  })

})
