import {Collection} from './collection'
import { SSet } from '../sset/sset';
import {StringSet} from '../string-set/string-set';

describe('collection', () => {
  describe('create', () => {
    it('should create collection', () => {
      let collection;
      const harry = {
        name: 'Harry',
        lastName: 'Potter'
      }
      const snape = {
        name: 'Severus',
        lastName: 'Snape'
      }
      expect(() => collection = Collection.fromArray([
        harry,
        snape
      ])).not.toThrow();
      expect(collection.size()).toEqual(2);
      expect(collection.findOne({
        name: 'Harry'
      })).toEqual(jasmine.objectContaining(harry))
      expect(collection.findOne({
        lastName: 'Potter'
      })).toEqual(jasmine.objectContaining(harry))
      expect(collection.findOne({
        name: 'Harry',
        lastName: 'Potter'
      })).toEqual(jasmine.objectContaining(harry))
      expect(collection.findOne({
        name: 'Severus'
      })).toEqual(jasmine.objectContaining(snape))
      expect(collection.findOne({
        lastName: 'Snape'
      })).toEqual(jasmine.objectContaining(snape))
      expect(collection.findOne({
        name: 'Severus',
        lastName: 'Snape'
      })).toEqual(jasmine.objectContaining(snape))
      expect(collection.findOne({
        name: 'Argus',
        lastName: 'Filch'
      })).toBeUndefined()
      expect(collection.findOne({
        inexistentKey: true
      })).toBeUndefined()
    })

    it('should add uuid (unique id) in case id field is missing', () => {
      let c = Collection.fromArray([]);
      expect(() => c = c.add({
        id: 'definedId'
      })).not.toThrow();
      expect(() => c = c.add({
        anotherItem: 'anotherItem'
      })).not.toThrow();
      expect(c.toArray()).toContain({
        id: 'definedId'
      });
      let anotherItem = c.toArray().find(i => i.anotherItem === 'anotherItem')
      expect(anotherItem).toBeDefined();
    })

    it('should forbid non-plain objects', () => {
      let c;
      expect(() => c = Collection.fromArray([
        ['1', '2']
      ])).toThrowError(
        `All items within a Collection must be plain objects`
      );
    })

    describe('filter collection hashes', () => {

      it('should create new collection from filtered hashes', () => {

        let gw = {
          name: 'George Washington',
          year: 1732
        };

        let ja = {
          name: 'John Adams',
          year: 1735
        };

        let tj =  {
          name: 'Thomas Jefferson',
          year: 1743
        };

        let c0 = Collection.fromArray([
          gw,
          ja,
          tj
        ]);

        let c;
        expect(() => c = c0.filterHashes(StringSet.fromArray([
          SSet.hashOf(gw),
          SSet.hashOf(ja)
        ]))).not.toThrow();
      })

      it('should copy metadata from collection', () => {

      })
    })
  })

  describe('findOne', () => {
    it('should return query properties intersection', () => {
      let collection;
      let harry = {
        name: 'Harry',
        lastName: 'Potter'
      }
      let lilian = {
        name: 'Lilian',
        lastName: 'Potter'
      }
      let silva = {
        name: 'Lilian',
        lastName: 'Silva'
      }
      expect(() => collection = Collection.fromArray([
        harry,
        silva,
        lilian
      ])).not.toThrow();
      expect(collection.findOne({
        lastName: 'Potter'
      })).toEqual(jasmine.objectContaining(harry))
      expect(collection.findOne({
        name: 'Lilian',
        lastName: 'Potter'
      })).toEqual(jasmine.objectContaining(lilian))
    })
  })

  describe('find', () => {
    it('should return a Collection of query items', () => {
      let collection;
      let harry = {
        name: 'Harry',
        lastName: 'Potter'
      }
      let lilian = {
        name: 'Lilian',
        lastName: 'Potter'
      }
      let silva = {
        name: 'Lilian',
        lastName: 'Silva'
      }
      expect(() => collection = Collection.fromArray([
        harry,
        silva,
        lilian
      ])).not.toThrow();
      expect(collection.find({
        lastName: 'Potter'
      }).toArray()).toContain(
        jasmine.objectContaining(harry),
      )
      expect(collection.find({
        lastName: 'Potter',
        name: 'Lilian'
      }).toArray()).toContain(
        jasmine.objectContaining(lilian),
      )
      expect(collection.find({
        lastName: 'Potter',
        name: 'Harry'
      }).toArray()).toContain(
        jasmine.objectContaining(harry),
      )
    })
  })

  describe('add', () => {
    it('adds new value to set and updates index', () => {
      let c;
      c = Collection.fromArray([]);
      expect(c.size()).toEqual(0)
      expect(() => c = c.add({
        name: 'Ronald',
        lastName: 'Weasley'
      })).not.toThrow();
      expect(c.size()).toEqual(1)
      expect(c.findOne({
        lastName: 'Weasley'
      })).toEqual(jasmine.objectContaining({
        name: 'Ronald',
        lastName: 'Weasley'
      }))
      expect(c.findOne({
        inexistentKey: 'test'
      })).toBeUndefined()
      expect(c.findOne({
        lastName: 'InexistentValue'
      })).toBeUndefined()
    })
  })

  describe('merge', () => {
    it('merges a new item into collection', () => {
      let c1;
      let r;
      c1 = Collection.fromArray([
        {
          name: 'Remus',
          lastName: 'Lupin',
          id: 'lupin'
        }
      ]);
      expect(() => r = c1.merge({
        name: 'Nymphadora',
        lastName: 'Tonks',
        id: 'tonks'
      })).not.toThrow();
      let rArr = r.toArray();
      expect(rArr.length).toEqual(2);
      expect(rArr).toContain(jasmine.objectContaining({
        name:'Remus',
        lastName: 'Lupin'
      }))
      expect(rArr).toContain(jasmine.objectContaining({
        name: 'Nymphadora',
        lastName: 'Tonks'
      }))

      expect(() => r = c1.merge({
        name:'Remus',
        lastName: 'Lupin',
        id: 'lupin'
      })).not.toThrow();
      rArr = r.toArray();
      expect(rArr.length).toEqual(1);
      expect(rArr).toContain(jasmine.objectContaining({
        name:'Remus',
        lastName: 'Lupin'
      }))
      expect(rArr).not.toContain(jasmine.objectContaining({
        name: 'Nymphadora',
        lastName: 'Tonks'
      }))

    })
  })

  describe('remove', () => {
    it('removes item from collection ', () => {
      let c;
      c = Collection.fromArray([]);
      expect(c.size()).toEqual(0)
      expect(() => c = c.add({
        name: 'Luna',
        id: 'luna',
        lastName: 'Lovegood'
      })).not.toThrow();
      expect(c.size()).toEqual(1)
      expect(c.findOne({
        lastName: 'Lovegood'
      })).toEqual(jasmine.objectContaining({
        name: 'Luna',
        lastName: 'Lovegood'
      }))
      expect(() => c = c.remove({
        name: 'Luna',
        id: 'luna',
        lastName: 'Lovegood'
      })).not.toThrow()
      expect(c.size()).toEqual(0)
      expect(c.findOne({
        lastName: 'Lovegood'
      })).toBeUndefined();
    })
  })

  describe('toArray', () => {
    it('converts collection to array', () => {
      let collection = Collection.fromArray([
        {
          name: 'abc',
          lastName: 'def'
        },
        {
          name: 'xyz',
          lastName: 'xyz'
        }
      ])
      let result;
      expect(() => result = collection.toArray()).not.toThrow();
      expect(result.length).toBe(2)
      expect(result).toContain(
        jasmine.objectContaining({
          name: 'xyz',
          lastName: 'xyz'
        })
      )
      expect(result).toContain(
        jasmine.objectContaining({
          name: 'abc',
          lastName: 'def'
        })
      )
    })
  })

  describe('union', () => {
    it('merges 2 collections into new one', () => {
      let c1;
      let c2;
      let r;
      c1 = Collection.fromArray([
        {
          name: 'Dolores',
          lastName: 'Umbridge'
        }
      ])
      c2 = Collection.fromArray([
        {
          name: 'Ronald',
          lastName: 'Weasley'
        }
      ])
      expect(() => r = c1.union(c2)).not.toThrow();
      let rArr = r.toArray();
      expect(rArr.length).toEqual(2);
      expect(rArr).toContain(jasmine.objectContaining({
        name: 'Dolores',
        lastName: 'Umbridge'
      }))
      expect(rArr.find(i => i.name === 'Dolores').id).toBeDefined();
      expect(rArr.find(i => i.name === 'Ronald').id).toBeDefined();
      expect(rArr).toContain(jasmine.objectContaining({
        name: 'Ronald',
        lastName: 'Weasley'
      }))
    })
  })

  describe('getOne', () => {
    it('should return a value from the Collection', () => {
      let c = Collection.fromArray([
        {id: 'firstItem'}
      ]);
      let item;
      expect(() => item = c.getOne()).not.toThrow();
      expect(item).toEqual({id: 'firstItem'});
      c = Collection.fromArray([]);
      expect(() => item = c.getOne()).not.toThrow();
      expect(item).toBeUndefined();
      c = Collection.fromArray([
        {id: 'firstItem'},
        {id: 'secondItem'},
        {id: 'thirdItem'}
      ]);
      expect(() => item = c.getOne()).not.toThrow();
      /* must be any of the three */
      expect([
        {id: 'firstItem'},
        {id:'secondItem'},
        {id: 'thirdItem'}
      ]).toContain(item);
    })
  })

  describe('getByHash', () => {
    it('should return item when given hash', () => {
      let c = Collection.fromArray([
        {
          id: 0,
          name: 'abc'
        },
        {
          id: 1,
          name: 'def'
        }
      ]);
      expect(c.getByHash(SSet.hashOf({
        id: 0,
        name: 'abc'
      }))).toEqual({
        id: 0,
        name: 'abc'
      });

      expect(c.getByHash(SSet.hashOf({
        id: 1,
        name: 'def'
      }))).toEqual({
        id: 1,
        name: 'def'
      });
    })
  })

  describe('getByIdHash', () => {
    it('should return item with given hashed id', () => {
      let c = Collection.fromArray([
        {
          id: 0,
          name: 'abc'
        },
        {
          id: 1,
          name: 'def'
        }
      ]);
      expect(c.getByIdHash(SSet.hashOf(0))).toEqual({
        id: 0,
        name: 'abc'
      });

      expect(c.getByIdHash(SSet.hashOf(1))).toEqual({
        id: 1,
        name: 'def'
      });
    })
  })

  describe('isEmpty', () => {
    it ('should return true for empty collection', () => {
      let c = Collection.fromArray([]);
      expect(c.isEmpty()).toBeTruthy();
      c = Collection.fromArray([
        {id: 'firstItem'}
      ]);
      expect(c.isEmpty()).toBeFalsy();
      c = Collection.fromArray([
        {id: 'firstItem'},
        {id: 'secondItem'}
      ]);
      expect(c.isEmpty()).toBeFalsy();
    })
  })

  describe('difference', () => {

    it('should allow difference from another collection', () => {
      let c = Collection.fromArray([
        {id: 5},
        {id: 7},
        {id: 8},
        {id: 9},
        {id: 12}
      ]),
      c2 = Collection.fromArray([
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 9},
        {id: 6},
        {id: 7}
      ]),
      c3;
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3.size()).toBe(3);
      expect(c3.has({id: 7})).toBeFalsy();
      expect(c3.has({id: 9})).toBeFalsy();
      expect(c3.has({id: 5})).toBeTruthy();
      expect(c3.has({id: 8})).toBeTruthy();
      expect(c3.has({id: 12})).toBeTruthy();
    })

    it('should return self reference when difference equals self', () => {
      let c = Collection.fromArray([
        {id: 5}, {id: 7}, {id: 8}, {id: 9}, {id: 12}
      ]),
      c2 = Collection.fromArray([
        {id: 89}, {id: 90}, {id: 8172}, {id: 123}
      ]),
      c3;
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3).toBe(c);

      c2 = Collection.fromArray([{id: 5}]);
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3).not.toBe(c);

    })

  })

  describe('iterators', () => {
    it('should contain iterator for "for ... of" loops', () => {
      let c = Collection.fromArray([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);
      let str = "";
      for (let item of c) {
        str += `${item.id};`;
      }
      expect(str).toContain('2;')
      expect(str).toContain('3;')
      expect(str).toContain('4;')
      expect(str).toContain('1;')
    })

    it('should contain forEach method', () => {
      const arr = [
        {id: 'abc'},
        {id: 'def'},
        {id: 'ghi'},
        {id: 'jkl'}
      ];
      let c = Collection.fromArray(arr);
      c.forEach(item => {
        expect(c.has(item)).toBeTruthy();
        let foundItem = arr.find((i) => {
          return i.id === item.id;
        })
        expect(foundItem).toEqual(item);
        arr.splice(arr.findIndex((i) => i.id === item.id), 1);
      })
      expect(arr.length).toBe(0);
    })

    it('should contain filter method', () => {
      const arr = ['Walked', 'Talked', 'Faked', 'Made', 'Did'].map(
        i => ({id: i})
      );
      let c = Collection.fromArray(arr);
      let c2 = c.filter(word => {
        return word.id.match(/ed$/)
      });
      expect(c2.has({id: 'Walked'})).toBeTruthy();
      expect(c2.has({id: 'Talked'})).toBeTruthy();
      expect(c2.has({id: 'Faked'})).toBeTruthy();
      expect(c2.has({id: 'Made'})).toBeFalsy();
      expect(c2.has({id: 'Did'})).toBeFalsy();
    })
  })

  describe('changes', () => {
    it('should output single changes between two collections', () => {
      let c1 = Collection.fromArray([]);
      let c2 = Collection.fromArray([])

      let diff;

      expect(() => diff = c2.changesFrom(c1)).not.toThrow();

      expect(diff.isEmpty()).toBeTruthy();
      expect(diff.toArray()).toEqual([])

      c1 = Collection.fromArray([
        {id: 'a'},
      ])
      c2 = Collection.fromArray([])
      expect(() => diff = c2.changesFrom(c1)).not.toThrow();
      expect(diff.toArray()).toEqual([{
        type: 'remove',
        id: 'a',
        item: {id: 'a'}
      }])

      c1 = Collection.fromArray([])
      c2 = Collection.fromArray([{id: 'a'}]);
      expect(() => diff = c2.changesFrom(c1)).not.toThrow();
      expect(diff.toArray()).toEqual([{
        type: 'add',
        id: 'a',
        item: {id: 'a'}
      }])

      c1 = Collection.fromArray([{id: 'a'}])
      c2 = Collection.fromArray([{id: 'a', name: 'cde'}]);
      expect(() => diff = c2.changesFrom(c1)).not.toThrow();
      expect(diff.toArray()).toEqual([{
        type: 'edit',
        id: 'a',
        before: {id: 'a'},
        after: {id: 'a', name: 'cde'}
      }]);

    })

    it('should output many changes between two collections', () => {
      let c1 = Collection.fromArray([
        {id: 'a'},
        {id: 'c'},
        {id: 'unchanged'}
      ]);
      let c2 = Collection.fromArray([
        {id: 'a', name: 'b'},
        {id: 'd', text: true},
        {id: 'unchanged'}
      ]);
      let diff;
      expect(() => diff = c2.changesFrom(c1)).not.toThrow();
      expect(diff.toArray()).toContain({
        type: 'edit',
        id: 'a',
        before: {id: 'a'},
        after: {id: 'a', name: 'b'}
      })
      expect(diff.toArray()).toContain({
        type: 'remove',
        id: 'c',
        item: {id: 'c'}
      })
      expect(diff.toArray()).toContain({
        type: 'add',
        id: 'd',
        item: {id: 'd', text: true}
      })
      expect(diff.toArray().length).toBe(3)

      c1 = Collection.fromArray([{notId: 'a'}])
      c2 = Collection.fromArray([{notId: 'a', name: 'cde'}]);
      expect(() => diff = c2.changesFrom(c1)).not.toThrow();
      expect(diff.toArray().length).toBe(2);
      expect(diff.toArray()).toContain(jasmine.objectContaining({
        type: 'remove',
        item: jasmine.objectContaining({notId: 'a'})
      }))
      expect(diff.toArray()).toContain(jasmine.objectContaining({
        type: 'add',
        item: jasmine.objectContaining({notId: 'a', name: 'cde'})
      }))
    })
  })

  describe('findHash', () => {
    it('should find property hash', () => {
      let c = Collection.fromArray([
        {a: true},
        {b: false}
      ])
      let r;
      expect(()=> r = c.findHash({
        a: SSet.hashOf(true)
      })).not.toThrow();
      expect(r.toArray()).toContain(jasmine.objectContaining({a: true}))
      expect(r.toArray().length).toBe(1);

      expect(()=> r = c.findHash({
        a: [SSet.hashOf(true)]
      })).not.toThrow();
      expect(r.toArray()).toContain(jasmine.objectContaining({a: true}))
      expect(r.toArray().length).toBe(1);

      expect(()=> r = c.findHash({
        a: []
      })).not.toThrow();
      expect(r.toArray().length).toBe(0);

      expect(()=> r = c.findHash({
        b: [SSet.hashOf(true)]
      })).not.toThrow();
      expect(r.toArray().length).toBe(0);

      expect(()=> r = c.findHash({
        b: [SSet.hashOf(false)]
      })).not.toThrow();
      expect(r.toArray()).toContain(jasmine.objectContaining({b: false}))
      expect(r.toArray().length).toBe(1);
      c = Collection.fromArray([
       {b: true},
       {b: false}
     ])
      expect(()=> r = c.findHash({
        b: [SSet.hashOf(false), SSet.hashOf(true)]
      })).not.toThrow();
      expect(r.toArray()).toContain(jasmine.objectContaining({b: false}))
      expect(r.toArray()).toContain(jasmine.objectContaining({b: true}))
      expect(r.toArray().length).toBe(2);


      c = Collection.fromArray([
       {y: 45, z: 54, id: 1}
     ])
      expect(()=> r = c.findHash({
        y: SSet.hashOf(45),
        z: SSet.hashOf(54)
      })).not.toThrow();
      expect(r.toArray()).toContain({y: 45, z: 54, id: 1})
      expect(r.toArray().length).toBe(1)

      c = Collection.fromArray([
       {y: 45, z: 54, id: 1}
     ])
      expect(()=> r = c.findHash({
        y: SSet.hashOf(78),
        z: SSet.hashOf(54)
      })).not.toThrow();
      expect(r.toArray().length).toBe(0)
    })
  })

  describe('findOneHash', () => {
    it('should find property hash', () => {
      let c = Collection.fromArray([
        {a: true, id: 3, m: 123, n: 456},
        {b: false, m: 234, n: 789}
      ])
      let r;
      expect(()=> r = c.findOneHash({
        a: SSet.hashOf(true),
        m: SSet.hashOf(123)
      })).not.toThrow();
      expect(r).toEqual({a: true, id: 3, m: 123, n: 456})

    })
  })

  describe('findOneHashOrigin', () => {
    it ('should one out of many query keys', () => {
      let a = Collection.fromArray([
        {name: 'Harry', id: 'harry', lastName: 'Potter'},
        {name: 'Lilian', lastName: 'Potter'},
        {name: 'James', lastName: 'Potter'}
      ]);
      let r;

      expect(() => r = a.findOneHashOrigin({
        lastName: SSet.hashOf('Potter'),
        name: SSet.hashOf('Harry')
      })).not.toThrow()

      expect(r).toEqual(
        SSet.hashOf({name: 'Harry', lastName: 'Potter', id: 'harry'})
      )

    })
  })

  describe('removeHash', () => {
    it('should remove hash from collection', () => {
      let c = Collection.fromArray([
        {name: 'Test', id: 'test'}
      ]);
      expect(c.size()).toEqual(1);
      expect(() => c = c.removeHash(
        SSet.hashOf({name: 'Test', id: 'test'}))
      ).not.toThrow();
      expect(c.isEmpty()).toBeTruthy();
    })
  })

  describe('getIndex', () => {
    it('should return index', () => {
      let c = Collection.fromArray([
        {name: 'Test', id: 'test'}
      ]);
      expect(c.getIndex()).toBeDefined();
    })
  })

  /* TODO: ids must be added to Collection.fromArray([item]) items */

})
