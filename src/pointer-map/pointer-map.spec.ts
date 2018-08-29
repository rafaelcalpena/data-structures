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

  describe('filter', () => {
    it('should keep items when function result is truthy', () => {
      let pm = PointerMap.fromObject({
        10: '',
        20: '',
        21: '',
        22: ''
      })
      let result;

      expect(() => result = pm.filter(i => i % 10 === 0)).not.toThrow()
      expect(result.toObject()).toEqual({
        10: '',
        20: ''
      })

      pm = PointerMap.fromObject({
        10: 'abc',
        20: 'def',
        21: 'ghi',
        22: 'jkl'
      })
      result;

      expect(() => result = pm.filter(i => i % 10 === 0)).not.toThrow()
      expect(result.toObject()).toEqual({
        10: 'abc',
        20: 'def'
      })

    })
  })

  describe('intersection', () => {
    it('should return the intersection between empty PointerMaps', () => {
      let p1 = PointerMap.fromObject({});
      let p2 = PointerMap.fromObject({});
      let i1;
      let i2;

      expect(() => i1 = p1.keysIntersection(p2)).not.toThrow();
      expect(() => i2 = p2.keysIntersection(p1)).not.toThrow();

      expect(i1.toObject()).toEqual({})
      expect(i2.toObject()).toEqual({})
    })

    it('should return the intersection between PointerMaps', () => {
      let p1 = PointerMap.fromObject({
        a: '123',
        b: '234',
        c: '345'
      });
      let p2 = PointerMap.fromObject({
        a: '567',
        b: '098',
        d: '745'
      });
      let i1;
      let i2;

      expect(() => i1 = p1.keysIntersection(p2)).not.toThrow();
      expect(() => i2 = p2.keysIntersection(p1)).not.toThrow();

      let expectedIntersection = {
        a: true,
        b: true
      };
      expect(i1.toObject()).toEqual(expectedIntersection)
      expect(i2.toObject()).toEqual(expectedIntersection)

      let i3;
      let p3 = PointerMap.fromObject({
        b: '32',
        c: '67'
      })

      expect(() => i3 = p1.keysIntersection(p2, p3)).not.toThrow();
      expect(i3.toObject()).toEqual({
        b: true
      })


    })
  })

  describe('inEvery', () => {
    it('checks whether key is present in all pointerMaps', () => {
      let p1 = PointerMap.fromObject({
        a: '1',
        b: '2'
      });
      let p2 = PointerMap.fromObject({
        a: '1',
        c: '2'
      });
      let result;
      expect(() => result = PointerMap.keyInEvery('a', [p1, p2])).not.toThrow()
      expect(result).toBeTruthy();
      expect(() => result = PointerMap.keyInEvery('b', [p1, p2])).not.toThrow()
      expect(result).toBeFalsy();
      expect(() => result = PointerMap.keyInEvery('c', [p1, p2])).not.toThrow()
      expect(result).toBeFalsy();
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

  describe('toPairs', () => {
    it('should convert to pairs', () => {
      const initialObj : [string, string][] = [
        ['a', 'b'],
        ['c', 'd']
      ]
      let pointerMap, result;
      pointerMap = PointerMap.fromPairs(initialObj)
      expect(() => {
        result = pointerMap.toPairs()
      }).not.toThrow();
      expect(result).toEqual(initialObj)
      pointerMap = pointerMap.remove('c');
      expect(() => {
        result = pointerMap.toPairs()
      }).not.toThrow();
      expect(result).toEqual([['a', 'b']])
    })
  })

  describe('reduce', () => {
    it('should run reduce function', () => {
      let pm = PointerMap.fromObject({
        a: 'b',
        c: 'd'
      })
      let result;
      expect(() => result = pm.reduce(
        (acc, v, k) => {
          return [...acc, k + v]
        },
        []
      )).not.toThrow()
      expect(result).toEqual([
        'ab',
        'cd'
      ])
    })
  })

})
