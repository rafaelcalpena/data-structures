import {Collection} from './collection'

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
      })).toEqual(harry)
      expect(collection.findOne({
        lastName: 'Potter'
      })).toEqual(harry)
      expect(collection.findOne({
        name: 'Harry',
        lastName: 'Potter'
      })).toEqual(harry)
      expect(collection.findOne({
        name: 'Severus'
      })).toEqual(snape)
      expect(collection.findOne({
        lastName: 'Snape'
      })).toEqual(snape)
      expect(collection.findOne({
        name: 'Severus',
        lastName: 'Snape'
      })).toEqual(snape)
      expect(collection.findOne({
        name: 'Argus',
        lastName: 'Filch'
      })).toBeUndefined()
      expect(collection.findOne({
        inexistentKey: true
      })).toBeUndefined()
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
      })).toEqual(harry)
      expect(collection.findOne({
        name: 'Lilian',
        lastName: 'Potter'
      })).toEqual(lilian)
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
      }).toArray()).toEqual([
        harry,
        lilian
      ])
      expect(collection.find({
        name: 'Lilian',
        lastName: 'Potter'
      }).toArray()).toEqual([
        lilian
      ])
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
      })).toEqual({
        name: 'Ronald',
        lastName: 'Weasley'
      })
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
          lastName: 'Lupin'
        }
      ]);
      expect(() => r = c1.merge({
        name: 'Nymphadora',
        lastName: 'Tonks'
      })).not.toThrow();
      let rArr = r.toArray();
      expect(rArr.length).toEqual(2);
      expect(rArr).toContain({
        name:'Remus',
        lastName: 'Lupin'
      })
      expect(rArr).toContain({
        name: 'Nymphadora',
        lastName: 'Tonks'
      })

      expect(() => r = c1.merge({
        name:'Remus',
        lastName: 'Lupin'
      })).not.toThrow();
      rArr = r.toArray();
      expect(rArr.length).toEqual(1);
      expect(rArr).toContain({
        name:'Remus',
        lastName: 'Lupin'
      })
      expect(rArr).not.toContain({
        name: 'Nymphadora',
        lastName: 'Tonks'
      })

    })
  })

  describe('remove', () => {
    it('removes item from collection ', () => {
      let c;
      c = Collection.fromArray([]);
      expect(c.size()).toEqual(0)
      expect(() => c = c.add({
        name: 'Luna',
        lastName: 'Lovegood'
      })).not.toThrow();
      expect(c.size()).toEqual(1)
      expect(c.findOne({
        lastName: 'Lovegood'
      })).toEqual({
        name: 'Luna',
        lastName: 'Lovegood'
      })
      expect(() => c = c.remove({
        name: 'Luna',
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
        {
          name: 'xyz',
          lastName: 'xyz'
        }
      )
      expect(result).toContain(
        {
          name: 'abc',
          lastName: 'def'
        }
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
      expect(rArr).toContain({
        name: 'Dolores',
        lastName: 'Umbridge'
      })
      expect(rArr).toContain({
        name: 'Ronald',
        lastName: 'Weasley'
      })
    })
  })

  describe('getOne', () => {
    it('should return a value from the Collection', () => {
      let c = Collection.fromArray([
        'firstItem'
      ]);
      let item;
      expect(() => item = c.getOne()).not.toThrow();
      expect(item).toEqual('firstItem');
      c = Collection.fromArray([]);
      expect(() => item = c.getOne()).not.toThrow();
      expect(item).toBeUndefined();
      c = Collection.fromArray([
        'firstItem',
        'secondItem',
        'thirdItem'
      ]);
      expect(() => item = c.getOne()).not.toThrow();
      /* must be any of the three */
      expect(['firstItem', 'secondItem', 'thirdItem']).toContain(item);
    })
  })

  describe('isEmpty', () => {
    it ('should return true for empty collection', () => {
      let c = Collection.fromArray([]);
      expect(c.isEmpty()).toBeTruthy();
      c = Collection.fromArray([
        'firstItem'
      ]);
      expect(c.isEmpty()).toBeFalsy();
      c = Collection.fromArray([
        'firstItem',
        'secondItem'
      ]);
      expect(c.isEmpty()).toBeFalsy();
    })
  })

  describe('difference', () => {

    it('should allow difference from another collection', () => {
      let c = Collection.fromArray([5, 7, 8, 9, 12]),
      c2 = Collection.fromArray([1, 2, 3, 4, 9, 6, 7]),
      c3;
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3.size()).toBe(3);
      expect(c3.has(7)).toBeFalsy();
      expect(c3.has(9)).toBeFalsy();
      expect(c3.has(5)).toBeTruthy();
      expect(c3.has(8)).toBeTruthy();
      expect(c3.has(12)).toBeTruthy();
    })

    it('should return self reference when difference equals self', () => {
      let c = Collection.fromArray([5, 7, 8, 9, 12]),
      c2 = Collection.fromArray([89, 90, 8172, 123]),
      c3;
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3).toBe(c);

      c2 = Collection.fromArray([5]);
      expect(() => c3 = c.difference(c2)).not.toThrow();
      expect(c3).not.toBe(c);

    })

  })

  describe('iterators', () => {
    it('should contain iterator for "for ... of" loops', () => {
      let c = Collection.fromArray([1, 2, 3, 4]);
      let str = "";
      for (let item of c) {
        str += `${item};`;
      }
      expect(str).toBe('2;1;3;4;')
    })

    it('should contain forEach method', () => {
      const arr = [
        'abc',
        'def',
        'ghi',
        'jkl'
      ];
      let c = Collection.fromArray(arr);
      c.forEach(item => {
        expect(c.has(item)).toBeTruthy()
        expect(arr.find((i) => i === item)).toEqual(item);
        arr.splice(arr.indexOf(item), 1);
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

})
