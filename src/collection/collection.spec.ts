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

})
