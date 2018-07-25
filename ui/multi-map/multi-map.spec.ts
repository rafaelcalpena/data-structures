import { MultiMap } from "./multi-map";

describe('MultiMap', () => {
  describe('create', () => {
    it('creates', () => {
      let multiMap, result;
      expect(() => multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['a', 'b']
      ])).toThrowError(`Could not create MultiMap: Pairs contain duplicate path 'a' -> 'b'`)

      expect(() => multiMap = MultiMap.fromPairs([
        []
      ])).not.toThrow()
      expect(() => result = multiMap.toObject()).not.toThrow()
      expect(result).toEqual({})

      expect(() => multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['b', 'a']
      ])).not.toThrow()
      expect(() => result = multiMap.toObject()).not.toThrow()
      expect(result).toEqual({
        a: {
          b: true
        },
        b: {
          a: true
        }
      })
    })

    it('has add method', () => {
      let multiMap = MultiMap.fromPairs([
        ['a','b'],
        ['b','c']
      ])
      expect(() => multiMap = multiMap.add('a', 'b')).toThrowError(
        `Could not add to MultiMap: Path 'a' -> 'b' already exists`
      )
      expect(() => multiMap = multiMap.add('b', 'd')).not.toThrow()
      let result;
      expect(() => result = multiMap.toObject()).not.toThrow()
      expect(result).toEqual({
        a: {
          b: true
        },
        b: {
          c: true,
          d: true
        }
      })
    })

    it('has has method', () => {
      let multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['b', 'c']
      ])
      let result;
      expect(() => result = multiMap.has('a')).not.toThrow();
      expect(result).toBeTruthy();
      expect(() => result = multiMap.has('n')).not.toThrow();
      expect(result).toBeFalsy();
      expect(() => result = multiMap.has('a', 'b')).not.toThrow();
      expect(result).toBeTruthy();
      expect(() => result = multiMap.has('a', 'z')).not.toThrow();
      expect(result).toBeFalsy();
      expect(() => result = multiMap.has('m', 'z')).not.toThrow();
      expect(result).toBeFalsy();
    })

    it('has remove method', () => {
      let multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['a', 'd'],
        ['b', 'c']
      ])
      expect(() => multiMap = multiMap.remove('n')).toThrowError(
        `Could not remove from MultiMap: key 'n' does not exist`
      );
      expect(() => multiMap = multiMap.remove('a')).not.toThrow();
      expect(multiMap.toObject()).toEqual({
        b: {
          c: true
        }
      });

      multiMap = MultiMap.fromPairs([
       ['a', 'b'],
       ['a', 'd'],
       ['b', 'c']
     ])
     expect(() => multiMap = multiMap.remove('a', 'n')).toThrowError(
       `Could not remove from MultiMap: path 'a' -> 'n' does not exist`
     );

      expect(() => multiMap = multiMap.remove('a', 'd')).not.toThrow();
      expect(multiMap.toObject()).toEqual({
        a: {
          b: true
        },
        b: {
          c: true
        }
      });

      expect(() => multiMap = multiMap.remove('a', 'b')).not.toThrow();
      expect(multiMap.toObject()).toEqual({
        b: {
          c: true
        }
      });

      expect(() => multiMap = multiMap.remove('m', 'n')).toThrowError(
        `Could not remove from MultiMap: key 'm' does not exist`
      );
    })

    it('has from method', () => {
      let multiMap = MultiMap.fromPairs([
       ['a', 'b'],
       ['a', 'd'],
       ['b', 'c']
     ])
     let result;
     expect(() => multiMap = multiMap.from('z')).toThrowError(
       `Could not read from MultiMap: key 'z' does not exist`
     );
     expect(() => result = multiMap.from('a')).not.toThrow();
     expect(result.toObject()).toEqual({
       b: true,
       d: true
     })

     expect(() => result = multiMap.from('b')).not.toThrow();
     expect(result.toObject()).toEqual({
       c: true
     })
    })
  })

  describe('conversion', () => {
    it('converts to object', () => {
      let multiMap, result;
      multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['a', 'c'],
        ['b', 'c']
      ])
      expect(() => result = multiMap.toObject()).not.toThrow()
      expect(result).toEqual({
        a: {
          b: true,
          c: true
        },
        b: {
          c: true
        }
      })

      multiMap = MultiMap.fromPairs([
        ['a', 'b'],
        ['b', 'a'],
        ['b', 'c']
      ])
      expect(() => result = multiMap.toObject()).not.toThrow()
      expect(result).toEqual({
        a: {
          b: true,
        },
        b: {
          a: true,
          c: true
        }
      })
    })
  })
})
