import {SMap} from './smap';
import { SSet } from '../sset/sset';
import _ = require('lodash');

describe('SMap', () => {
  describe('creation', () => {

    it('should allow creating from pairs', () => {
      let smap;
      expect(() => {
        smap = SMap.fromPairs([
          ['abc', 'def']
        ])
      }).not.toThrow();
      expect(smap.internalState.items.size()).toEqual(2);
      expect(smap.internalState.items.equals(
        SSet.fromArray([
          'abc', 'def'
        ])
      )).toBeTruthy();
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('abc')]: SSet.hashOf('def')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual(
        {
          [SSet.hashOf('def')]: {
            [SSet.hashOf('abc')]: true
          }
        }
      );


      expect(() => {
        smap = SMap.fromPairs([
          ['abc', 'def'],
          ['ghi', 'def']
        ])
      }).not.toThrow();
      expect(smap.internalState.items.size()).toEqual(3);
      expect(smap.internalState.items.equals(
        SSet.fromArray([
          'abc', 'ghi', 'def'
        ])
      )).toBeTruthy();
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('abc')]: SSet.hashOf('def'),
        [SSet.hashOf('ghi')]: SSet.hashOf('def')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('def')]: {
          [SSet.hashOf('abc')]: true,
          [SSet.hashOf('ghi')]: true
        }
      });


      expect(() => {
        smap = SMap.fromPairs([
          ['abc', 'def'],
          ['ghi', 'jkl']
        ])
      }).not.toThrow();
      expect(smap.internalState.items.size()).toEqual(4);
      expect(smap.internalState.items.equals(
        SSet.fromArray([
          'abc', 'ghi', 'def', 'jkl'
        ])
      )).toBeTruthy();
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('abc')]: SSet.hashOf('def'),
        [SSet.hashOf('ghi')]: SSet.hashOf('jkl')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('def')]: {
          [SSet.hashOf('abc')]: true
        },
        [SSet.hashOf('jkl')]: {
          [SSet.hashOf('ghi')]: true
        }
      });


      expect(() => {
        smap = SMap.fromPairs([
          ['abc', 'def'],
          ['abc', 'jkl']
        ])
      }).toThrowError(`2 pairs have the same keys: "abc"`);

      expect(() => {
        smap = SMap.fromPairs([
          [1, true],
          [3, 1]
        ]);
      }).not.toThrow();
      expect(smap.internalState.items.size()).toEqual(3);
      expect(smap.internalState.items.equals(
        SSet.fromArray([
          1, true, 3
        ])
      )).toBeTruthy()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf(1)]: SSet.hashOf(true),
        [SSet.hashOf(3)]: SSet.hashOf(1)
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf(1)]: {
          [SSet.hashOf(3)]: true
        },
        [SSet.hashOf(true)]: {
          [SSet.hashOf(1)]: true
        }
      });
    })

  })

  describe('removal', () => {
    it('should remove item from map', () => {
      let smap;
      smap = SMap.fromPairs([['a', 'b'], ['c','d'] ]);

      expect(
        () => smap = smap.remove('m')
      ).toThrowError(`Could not remove from SMap: key 'm' does not exist`)
      expect(
        () => smap = smap.remove('m', 'n')
      ).toThrowError(`Could not remove from SMap: key 'm' does not exist`)

      expect(
        () => smap = smap.remove('a')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('c')]: SSet.hashOf('d'),
      })

      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('d')]: {
          [SSet.hashOf('c')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(2);

      smap = SMap.fromPairs([['a', 'b'], ['b','a'] ]);
      expect(
        () => smap = smap.remove('a')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('b')]: SSet.hashOf('a'),
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('a')]: {
          [SSet.hashOf('b')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(2);

    })

    it('allows same key and value', () => {
      let smap;
      smap = SMap.fromPairs([['a', 'a'], ['b', 'b'] ]);
      expect(
        () => smap = smap.remove('a')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('b')]: SSet.hashOf('b'),
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('b')]: {
          [SSet.hashOf('b')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(1);


      smap = SMap.fromPairs([['a', 'b'], ['b', 'c'], ['d','c'] ]);
      expect(
        () => smap = smap.remove('a')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('b')]: SSet.hashOf('c'),
        [SSet.hashOf('d')]: SSet.hashOf('c'),
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('c')]: {
          [SSet.hashOf('b')]: true,
          [SSet.hashOf('d')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(3);
    })

  })

  describe('add', () => {
    it('should add new key/value pair to map', () => {
      let smap;
      smap = SMap.fromPairs([['a', 'b']]);
      expect(
        () => smap = smap.add('a', 'b')
      ).toThrowError(`Could not add to SMap: key 'a' already exists`);

      smap = SMap.fromPairs([['a', 'b']]);
      expect(
        () => smap = smap.add('a', 'c')
      ).toThrowError(`Could not add to SMap: key 'a' already exists`);

      smap = SMap.fromPairs([['a', 'b']]);
      expect(
        () => smap = smap.add('c', 'd')
      ).not.toThrow();
      expect(smap.toPairs()).toEqual([['a', 'b'],  ['c', 'd']]);
    })
  })

  describe('set', () => {
    it('should allow updating a value for a given key', () => {

      let smap;
      smap = SMap.fromPairs([['a', 'b'], ['c','d'] ]);
      expect(() => smap = smap.set('a', 'b')).not.toThrow();
      expect(smap.toPairs()).toEqual([
        ['a', 'b'],
        ['c', 'd']
      ])
      expect(smap.internalState.items.toArray().sort()).toEqual(
        ['a', 'b', 'c', 'd'].sort()
      )
      expect(smap.internalState.items.size()).toBe(4);

      expect(() => smap = smap.set('e', 'f')).not.toThrow();
      expect(smap.toPairs()).toEqual([
        ['a', 'b'],
        ['c', 'd'],
        ['e', 'f']
      ])
      expect(smap.internalState.items.toArray().sort()).toEqual(
        ['a', 'b', 'c', 'd', 'e', 'f'].sort()
      )
      expect(smap.internalState.items.size()).toBe(6);

      smap = SMap.fromPairs([['a', 'b'], ['c','d'] ]);
      expect(() => smap = smap.set('c', 'e')).not.toThrow();
      expect(smap.toPairs()).toEqual([
        ['a', 'b'],
        ['c', 'e']
      ])
      expect(smap.internalState.items.toArray().sort()).toEqual(
        ['a', 'b', 'c', 'e'].sort()
      )
      expect(smap.internalState.items.size()).toBe(4);


      smap = SMap.fromPairs([['a', 'b'], ['c','d'] ]);
      expect(
        () => smap = smap.set('a', 'm')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('a')]: SSet.hashOf('m'),
        [SSet.hashOf('c')]: SSet.hashOf('d')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('d')]: {
          [SSet.hashOf('c')]: true
        },
        [SSet.hashOf('m')]: {
          [SSet.hashOf('a')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(4);


      smap = SMap.fromPairs([['a', 'c'], ['c','m'] ]);

      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('a')]: SSet.hashOf('c'),
        [SSet.hashOf('c')]: SSet.hashOf('m')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('m')]: {
          [SSet.hashOf('c')]: true
        },
        [SSet.hashOf('c')]: {
          [SSet.hashOf('a')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(3);
      expect(
        () => smap = smap.set('c', 'a')
      ).not.toThrow()
      expect(smap.internalState.hashMap.toObject()).toEqual({
        [SSet.hashOf('a')]: SSet.hashOf('c'),
        [SSet.hashOf('c')]: SSet.hashOf('a')
      })
      expect(smap.internalState.inverseMap.toObject()).toEqual({
        [SSet.hashOf('a')]: {
          [SSet.hashOf('c')]: true
        },
        [SSet.hashOf('c')]: {
          [SSet.hashOf('a')]: true
        }
      });
      expect(smap.internalState.items.size()).toBe(2);
    })
  })

  describe('conversion', () => {

    it('converts smap to pairs', () => {
      let smap, result;
      smap = SMap.fromPairs([['a', 'b'], ['c','d'] ]);

      expect(() => result = smap.toPairs()).not.toThrow();
      expect(result).toEqual([
        ['a', 'b'],
        ['c', 'd']
      ])
      expect(() => smap = smap.remove('a')).not.toThrow();
      expect(() => result = smap.toPairs()).not.toThrow();
      expect(result).toEqual([
        ['c', 'd']
      ])

      let characters : [any, any][] = [
        [
          {name: 'Harry'},
          {lastName: 'Potter'}
        ],
        [
          {name: 'Gellert'},
          {lastName: 'Grindewald'}
        ]
      ];
      smap = SMap.fromPairs(characters);
      expect(() => result = smap.toPairs()).not.toThrow();
      expect(result).toEqual(characters)
      expect(() => smap = smap.remove({
        name: 'Harry'
      })).not.toThrow();
      expect(() => result = smap.toPairs()).not.toThrow();
      expect(result).toEqual([
        [
          {name: 'Gellert'},
          {lastName: 'Grindewald'}
        ]
      ])

    })

  })

});
