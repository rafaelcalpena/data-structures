import {DefaultIndex} from './default-index'

describe('DefaultIndex', () => {
  describe('create fromTriples', () => {

    it('should throw error when duplicate triples exist', () => {
      let index;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
        ['a', 'b', 'c']
      ])).toThrowError(
        `Could not add to DefaultIndex: path 'a, b, c' already exists`
      )
    })

    it('should create', () => {
      let index;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c']
      ])).not.toThrow()
    })

  })

  describe('from', () => {
    it('returns MultiMap when argument is propName', () => {
      let index, result;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c']
      ])).not.toThrow()
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
        ['a', 'c', 'd'],
        ['a', 'c', 'z'],
        ['b', 'e', 'f']
      ])).not.toThrow()
      expect(index.toObject()).toEqual({
        a: {
          b: {
            c: true
          },
          c: {
            d: true,
            z: true
          }
        },
        b: {
          e: {
            f: true
          }
        }
      })

      expect(() => result = index.from('inexistentKey')).toThrowError(
        `Could not read from DefaultIndex: key 'inexistentKey' does not exist`
      )

      expect(() => result = index.from('a')).not.toThrow()
      expect(result.toObject()).toEqual({
        b: {
          c: true
        },
        c: {
          d: true,
          z: true
        }
      })

      expect(() => result = index.from('a', 'inexistentValue')).toThrowError(
        `Could not read from DefaultIndex: path 'a -> inexistentValue' does not exist`
      )

      expect(() => result = index.from('a', 'b')).not.toThrow()
      expect(result.toObject()).toEqual({
          c: true
      })

      expect(() => result = index.from('a', 'c')).not.toThrow()
      expect(result.toObject()).toEqual({
          d: true,
          z: true
      })

    })
  })

  describe('conversion', () => {
    describe('toObject', () => {
      it('should contain toObject method', () => {
        let index, result;
        expect(() => index = DefaultIndex.fromTriples([
          ['a', 'b', 'c']
        ])).not.toThrow()
        expect(() => result = index.toObject()).not.toThrow();
        expect(result).toEqual({
          a: {
            b: {
              c: true
            }
          }
        })
      })
    })
  })

  describe('has', () => {
    it('checks if item is contained in instance', () => {
      let index, result;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
        ['a', 'c', 'd'],
        ['a', 'c', 'z'],
        ['b', 'e', 'f']
      ])).not.toThrow()
      expect(() => result = index.has('inexistentKey')).not.toThrow()
      expect(result).toEqual(false);
      expect(() => result = index.has('a')).not.toThrow()
      expect(result).toEqual(true);
      expect(() => result = index.has('a', 'b')).not.toThrow()
      expect(result).toEqual(true);
      expect(() => result = index.has('a', 'inexistentValue')).not.toThrow()
      expect(result).toEqual(false);
      expect(() => result = index.has('a', 'b', 'inexistentRef')).not.toThrow()
      expect(result).toEqual(false);
      expect(() => result = index.has('a', 'b', 'c')).not.toThrow()
      expect(result).toEqual(true);
      expect(() => result = index.has('a', 'c', 'c')).not.toThrow()
      expect(result).toEqual(false);
      expect(() => result = index.has('a', 'c')).not.toThrow()
      expect(result).toEqual(true);
    })
  })

  describe('add', () => {
    it('should throw error when duplicate triples exist', () => {
      let index;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
      ])).not.toThrow();
      expect(() => index = index.add('a', 'b', 'c')).toThrowError(
        `Could not add to DefaultIndex: path 'a, b, c' already exists`
      )
      expect(() => index = index.add('d', 'e', 'f')).not.toThrow();
      expect(index.toObject()).toEqual({
        a: {
          b: {
            c: true
          }
        },
        d: {
          e: {
            f: true
          }
        }
      })
      expect(() => index = index.add('a', 'e', 'z')).not.toThrow();
      expect(index.toObject()).toEqual({
        a: {
          b: {
            c: true
          },
          e: {
            z: true
          }
        },
        d: {
          e: {
            f: true
          }
        }
      })
      expect(() => index = index.add('a', 'b', 'z')).not.toThrow();
      expect(index.toObject()).toEqual({
        a: {
          b: {
            c: true,
            z: true
          },
          e: {
            z: true
          }
        },
        d: {
          e: {
            f: true
          }
        }
      })
    })
  })

  describe('remove', () => {
    it('should throw error when removing inexistent triple', () => {
      let index;
      expect(() => index = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
      ])).not.toThrow();
      expect(() => index = index.remove('x', 'y', 'z')).toThrowError(
        `Could not remove from DefaultIndex: path 'x, y, z' does not exist`
      )
      expect(() => index = index.remove('a', 'b', 'z')).toThrowError(
        `Could not remove from DefaultIndex: path 'a, b, z' does not exist`
      )
      expect(() => index = index.remove('a', 'y', 'z')).toThrowError(
        `Could not remove from DefaultIndex: path 'a, y, z' does not exist`
      )
      expect(index.toObject()).toEqual({
        a: {
          b: {
            c: true
          }
        }
      })
      expect(() => index = index.remove('a', 'b', 'c')).not.toThrow()
      expect(index.toObject()).toEqual({
      })
    })
  })

  describe('get', () => {
    it ('should return value for provided keys', () => {
      let c = DefaultIndex.fromTriples([
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);
      let result;

      expect(() => result = c.get('a', 'b')).not.toThrow();
      expect(result).toEqual('c')

      expect(() => result = c.get('d', 'e')).not.toThrow();
      expect(result).toEqual('f')      
    })
  })
})
