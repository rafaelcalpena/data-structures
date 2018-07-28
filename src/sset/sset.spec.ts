import {SSet} from './sset';

describe('SSet', () => {
  describe('SHA1 algorithm', () => {
    it ('should use object-hash sha1 algorithm', () => {
      /* string:13:Washington DC => sha1 */
      expect(SSet.hashOf('Washington DC')).toBe('581095ffcf20b97094875fceca31850bf96dfb61');
      /* TODO: Remove prototype, __proto and constructor from options */
      /* object:3:string:4:city:string:11:Santo Andre,string:7:country:string:6:Brazil,string:5:state:string:9:Sao Paulo, => sha1 */
      expect(SSet.hashOf(
        {
          city: 'Santo Andre',
          state: 'Sao Paulo',
          country: 'Brazil'
        }
      )).toBe('8507fcb5f59d94ed76b6c3a571bfac26654d541b')
    })
  })

  describe('from array', () => {
    it ('should create from array', () => {
      let sset;
      expect(() => {
        sset = SSet.fromArray([]);
      }).not.toThrow();
      expect(
        sset.size()
      ).toBe(0);
      expect(() => {
        sset = SSet.fromArray([
          'test'
        ]);
      }).not.toThrow();
      expect(
        sset.size()
      ).toBe(1);
      expect(
        sset.has('test')
      ).toBeTruthy();
      expect(
        sset.has('unset value')
      ).toBeFalsy();
    })

    describe('should stringify before creating', () => {
      const circularObj = {
        a: { }
      }
      circularObj.a = circularObj;
      it('should not allow circular objects', () => {
        expect(() => {
          SSet.fromArray([circularObj]);
        }).toThrow();
      })

    })
  })

  describe('difference', () => {

    it('should allow difference from another set', () => {
      let sset = SSet.fromArray([5, 7, 8, 9, 12]),
      sset2 = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
      sset3;
      expect(() => sset3 = sset.difference(sset2)).not.toThrow();
      expect(sset3.size()).toBe(3);
      expect(sset3.has(7)).toBeFalsy();
      expect(sset3.has(9)).toBeFalsy();
      expect(sset3.has(5)).toBeTruthy();
      expect(sset3.has(8)).toBeTruthy();
      expect(sset3.has(12)).toBeTruthy();
    })

  })

  describe('isEmpty', () => {
    it('should contain isEmpty method', () => {
      let sset = SSet.fromArray([]),
      isEmpty;
      expect(() => isEmpty = sset.isEmpty()).not.toThrow();
      expect(isEmpty).toBeTruthy();
      expect(() => sset = sset.add(1)).not.toThrow();
      expect(() => isEmpty = sset.isEmpty()).not.toThrow();
      expect(isEmpty).toBeFalsy();

      let sset2 = SSet.fromArray([1,2]);
      expect(() => sset2 = sset2.remove(1)).not.toThrow();
      expect(() => isEmpty = sset2.isEmpty()).not.toThrow();
      expect(isEmpty).toBeFalsy();
      expect(() => sset2 = sset2.remove(2)).not.toThrow();
      expect(() => isEmpty = sset2.isEmpty()).not.toThrow();
      expect(isEmpty).toBeTruthy();
    })
  })

  describe('loops, iterators and iterables', () => {
    it('should contain forEach method', () => {
      const arr = [
        'abc',
        'def',
        'ghi',
        'jkl'
      ];
      let sset = SSet.fromArray(arr);
      sset.forEach(item => {
        expect(sset.has(item)).toBeTruthy()
        expect(arr.find((i) => i === item)).toEqual(item);
        arr.splice(arr.indexOf(item), 1);
      })
      expect(arr.length).toBe(0);
    })

    it('should contain map method', () => {
      const arr = [1, 2, 3, 4];
      let sset = SSet.fromArray(arr);
      const sset2 = sset.map(item => item * 3);
      expect(sset.size()).toBe(4);
      expect(sset2.size()).toBe(4);

      expect(sset2.has(1)).toBeFalsy();
      expect(sset2.has(2)).toBeFalsy();
      expect(sset2.has(4)).toBeFalsy();
      expect(sset2.has(3)).toBeTruthy();
      expect(sset2.has(6)).toBeTruthy();
      expect(sset2.has(9)).toBeTruthy();
      expect(sset2.has(12)).toBeTruthy();
    })

    it('should contain filter method', () => {
      const arr = ['Walked', 'Talked', 'Faked', 'Made', 'Did'];
      let sset = SSet.fromArray(arr);
      let sset2 = sset.filter(word => {
        return word.match(/ed$/)
      });
      expect(sset2.has('Walked')).toBeTruthy();
      expect(sset2.has('Talked')).toBeTruthy();
      expect(sset2.has('Faked')).toBeTruthy();
      expect(sset2.has('Made')).toBeFalsy();
      expect(sset2.has('Did')).toBeFalsy();
    })

    it('should contain reduce method', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      let sset = SSet.fromArray(arr);
      let sum = sset.reduce((acc, value) => {
        return acc += value;
      }, 0);
      expect(sum).toBe(21);
      let multiplication = sset.reduce((acc, value: number) => {
        return acc * value;
      }, 1);
      expect(multiplication).toBe(720);
    })

    it('should contain every method', () => {
      const arr = [1, 2, 3, 4];
      let sset = SSet.fromArray(arr);
      let isTruthy = sset.every(n => n <= 4);
      expect(isTruthy).toBeTruthy();
      let isFalsy = sset.every(n => n >= 8);
      expect(isFalsy).toBeFalsy();

    })

    it('should contain some method', () => {
      const arr = [1, 2, 3, 4];
      let sset = SSet.fromArray(arr);
      let isTruthy = sset.some(n => n % 3 === 0);
      expect(isTruthy).toBeTruthy();
      let isFalsy = sset.some(n => n % 5 === 0);
      expect(isFalsy).toBeFalsy();
    })

    it('should contain find method', () => {
      const arr = [1, 2, 3, 4];
      let sset = SSet.fromArray(arr);
      let isThree = sset.find(n => n % 3 === 0);
      expect(isThree).toBe(3);
      let isUndefined = sset.find(n => n % 5 === 0);
      expect(isUndefined).toBeUndefined();
    });

    it('should contain iterator for "for ... of" loops', () => {
      let sset = SSet.fromArray([1, 2, 3, 4]);
      let str = "";
      for (let item of sset) {
        str += `${item};`;
      }
      expect(str).toBe('2;1;3;4;')
    })
  })

  describe('item operations', () => {
    describe('add', () => {
      describe('immutability', () => {
        it('should create new SSet on add operation', () => {
          let sset = SSet.fromArray([]), sset2;
          expect(sset.size()).toEqual(0);

          expect(() => sset2 = sset.add(
            {
              name: 'Albert Einstein',
              from: 'Germany'
            }
          )).not.toThrow();

          expect(sset2).not.toEqual(sset);
        })
      })

      it('should allow for addition', () => {
        let sset = SSet.fromArray([]);

        expect(() => sset = sset.add(
          {
            name: 'Erwin Schrodinger',
            from: 'Austria'
          }
        )).not.toThrow();
        expect(sset.size()).toEqual(1);

      })

      it('should not allow for duplicated items', () => {
        let sset = SSet.fromArray([]);

        expect(() => sset = sset.add(
          {
            name: 'Erwin Schrodinger',
            from: 'Austria'
          }
        )).not.toThrow();
        expect(sset.size()).toEqual(1);

        expect(() => sset = sset.add(
          {
            name: 'Erwin Schrodinger',
            from: 'Austria'
          }
        )).toThrowError('Value [object Object] is already contained in the set');

      })
    })

    describe('remove', () => {

        it('should allow for removal', () => {
          let sset;
          sset = SSet.fromArray([
            {
              name: 'De Broglie',
              from: 'France'
            }
          ]);

          expect(sset.size()).toEqual(1);

          sset = SSet.fromArray([]);
          expect(sset.size()).toEqual(0);

          expect(() => sset = sset.add(
            {
              name: 'De Broglie',
              from: 'France'
            }
          )).not.toThrow();
          expect(sset.size()).toEqual(1);

          expect(() => sset = sset.remove(
            {
              from: 'France',
              name: 'De Broglie'
            }
          )).not.toThrow();
          expect(sset.size()).toEqual(0);

          expect(() => sset = sset.remove(
            {
              from: 'France',
              name: 'De Broglie'
            }
          )).toThrowError('There is no value [object Object] in the set.');
          expect(sset.size()).toEqual(0);
        })
    })

    describe('merge', () => {
      it('should merge an existing item', () => {
        let sset = SSet.fromArray([]);
        sset = sset.add('abc');
        expect(() => sset = sset.add('abc')).toThrowError();
        expect(() => sset = sset.merge('abc')).not.toThrowError();
        expect(sset.size()).toBe(1);
        sset = sset.merge('def');
        sset = sset.merge('fgh');
        expect(sset.size()).toBe(3);
        sset = sset.merge('fgh');
        expect(sset.size()).toBe(3);
      })

      it('should allow merging an array of values', () => {
        let sset = SSet.fromArray([0, 1, 2]);
        sset = sset.mergeArray([3, 4, 5]);
        expect(sset.size()).toEqual(6);
        expect(sset.has(0)).toBeTruthy();
        expect(sset.has(1)).toBeTruthy();
        expect(sset.has(2)).toBeTruthy();
        expect(sset.has(3)).toBeTruthy();
        expect(sset.has(4)).toBeTruthy();
        expect(sset.has(5)).toBeTruthy();
      })
    })
  })

  describe('two-set operations', () => {
    describe('union', () => {
      it('should allow merging another set', () => {
        let sset = SSet.fromArray([0, 1, 2]);
        let sset2 = SSet.fromArray([2, 4, 5]);
        let sset3;
        expect(() => sset3 = sset.union(sset2)).not.toThrow();
        expect(sset3.size()).toEqual(5);
        expect(sset3.has(5)).toBeTruthy();
        expect(sset3.has(4)).toBeTruthy();
        expect(sset3.has(2)).toBeTruthy();
        expect(sset3.has(0)).toBeTruthy();
        expect(sset3.has(1)).toBeTruthy();
      })

      it('should avoid input type set on merge method', () => {
        let sset = SSet.fromArray([5, 7, 8, 9, 12]),
        sset2 = SSet.fromArray([1, 2, 3, 4]),
        sset3;
        expect(() => sset3 = sset.merge(sset2)).toThrowError('Please use union for merging two sets');
      })
    })

    describe('isSubset', () => {
      it('should contain isSubset method', () => {
        let sset = SSet.fromArray([1, 2, 3, 4]),
        sset2 = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset3 = SSet.fromArray([36, 89, 94]),
        isSubset;
        expect(() => isSubset = sset.isSubset(sset2)).not.toThrow();
        expect(isSubset).toBeTruthy();
        expect(() => isSubset = sset2.isSubset(sset)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset2.isSubset(sset3)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset.isSubset(sset3)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset3.isSubset(sset)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset3.isSubset(sset2)).not.toThrow();
        expect(isSubset).toBeFalsy();
      })
    })

    describe('inSet', () => {
      it('should contain inSet method alias', () => {
        let sset = SSet.fromArray([1, 2, 3, 4]),
        sset2 = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset3 = SSet.fromArray([36, 89, 94]),
        isSubset;
        expect(() => isSubset = sset.inSet(sset2)).not.toThrow();
        expect(isSubset).toBeTruthy();
        expect(() => isSubset = sset2.inSet(sset)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset2.inSet(sset3)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset.inSet(sset3)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset3.inSet(sset)).not.toThrow();
        expect(isSubset).toBeFalsy();
        expect(() => isSubset = sset3.inSet(sset2)).not.toThrow();
        expect(isSubset).toBeFalsy();
      })
    })

    describe('isSuperset', () => {
      it('should contain isSuperset method', () => {
        let sset = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset2 = SSet.fromArray([1, 2, 3, 4]),
        sset3 = SSet.fromArray([9,6]),
        sset4 = SSet.fromArray([9, 87]),
        isSuperset;
        expect(() => isSuperset = sset.isSuperset(sset2)).not.toThrow();
        expect(isSuperset).toBeTruthy();
        expect(() => isSuperset = sset.isSuperset(sset3)).not.toThrow();
        expect(isSuperset).toBeTruthy();
        expect(() => isSuperset = sset.isSuperset(sset4)).not.toThrow();
        expect(isSuperset).toBeFalsy();
      })
    })

    describe('hasSet', () => {
      it('should contain hasSet method alias', () => {
        let sset = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset2 = SSet.fromArray([1, 2, 3, 4]),
        sset3 = SSet.fromArray([9,6]),
        sset4 = SSet.fromArray([9, 87]),
        isSuperset;
        expect(() => isSuperset = sset.hasSet(sset2)).not.toThrow();
        expect(isSuperset).toBeTruthy();
        expect(() => isSuperset = sset.hasSet(sset3)).not.toThrow();
        expect(isSuperset).toBeTruthy();
        expect(() => isSuperset = sset.hasSet(sset4)).not.toThrow();
        expect(isSuperset).toBeFalsy();
      })
    })

    describe('equals', () => {
      it('should contain equals method', () => {
        let sset = SSet.fromArray([1, 2, 3, 4]),
        sset2 = SSet.fromArray([5, 6, 7, 8]),
        equals;
        expect(() => equals = sset.equals(sset2)).not.toThrow();
        expect(equals).toBeFalsy();
        expect(() => equals = sset2.equals(sset)).not.toThrow();
        expect(equals).toBeFalsy();

        sset2 = SSet.fromArray([1, 2, 3, 4]);
        expect(() => equals = sset.equals(sset2)).not.toThrow();
        expect(equals).toBeTruthy();
        expect(() => equals = sset2.equals(sset)).not.toThrow();
        expect(equals).toBeTruthy();
      })
    })

    describe('symmetricDifference', () => {
      it('should allow symmetric difference from another set', () => {
        let sset = SSet.fromArray([5, 7, 8, 9, 12]),
        sset2 = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset3;
        expect(() => sset3 = sset.symmetricDifference(sset2)).not.toThrow();
        expect(sset3.has(1)).toBeTruthy();
        expect(sset3.has(2)).toBeTruthy();
        expect(sset3.has(3)).toBeTruthy();
        expect(sset3.has(4)).toBeTruthy();
        expect(sset3.has(5)).toBeTruthy();
        expect(sset3.has(6)).toBeTruthy();
        expect(sset3.has(7)).toBeFalsy();
        expect(sset3.has(8)).toBeTruthy();
        expect(sset3.has(9)).toBeFalsy();
        expect(sset3.has(12)).toBeTruthy();
        expect(sset3.size()).toBe(8);
      })
    })

    describe('intersection', () => {
      it('should allow intersection with another set', () => {
        let sset = SSet.fromArray([5, 7, 8, 9, 12]),
        sset2 = SSet.fromArray([1, 2, 3, 4, 9, 6, 7]),
        sset3;
        expect(() => sset3 = sset.intersection(sset2)).not.toThrow();
        expect(sset3.size()).toBe(2);
        expect(sset3.has(7)).toBeTruthy();
        expect(sset3.has(9)).toBeTruthy();
        expect(sset3.has(5)).toBeFalsy();
        expect(sset3.has(8)).toBeFalsy();
        expect(sset3.has(12)).toBeFalsy();
      })
    })

    describe('isDisjoint', () => {
      it('should contain isDisjoint method', () => {
        const arr = [1, 2, 3];
        const arr2 = [4, 5, 6];
        const arr3 = [3, 5, 6];
        let sset = SSet.fromArray(arr), sset2 = SSet.fromArray(arr2),
        isDisjoint;
        expect(() => isDisjoint = sset.isDisjoint(sset2)).not.toThrow();
        expect(isDisjoint).toBeTruthy();
        sset2 = SSet.fromArray(arr3);
        expect(() => isDisjoint = sset.isDisjoint(sset2)).not.toThrow();
        expect(isDisjoint).toBeFalsy();
      })
    })
  })

  describe('conversions', () => {
    it('should have toArray method', () => {
      const sset = SSet.fromArray(['sunday', 'monday', 'tuesday']);
      const arr = sset.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain('sunday');
      expect(arr).toContain('monday');
      expect(arr).toContain('tuesday');
    })
    describe('JSON Conversion', () => {
      it('converts SSet to JSON and strips out keys', () => {
        let sset = SSet.fromArray([
          {name: 'ABC'},
          {name: 'DEF'}
        ]),
        jsonSet, parsedSet, sset2;
        expect(() => jsonSet = JSON.stringify(sset)).not.toThrow();
        expect(() => parsedSet = JSON.parse(jsonSet)).not.toThrow();
        expect(parsedSet.statePropsPlugins).not.toBeDefined();
        expect(parsedSet.state).toBeDefined();
        expect(parsedSet.props).toBeDefined();
        expect(parsedSet.state).toEqual([
          {name: 'DEF'},
          {name: 'ABC'}
        ])
        expect(parsedSet.props.size).toBe(2);

        expect(() => sset2 = SSet.fromJSON(jsonSet)).not.toThrow();
        expect(sset2.equals(sset)).toBeTruthy();
      })

    })
  })

  describe('plugins/extensions', () => {
    describe('before SSet creation', () => {
      it('should allow creation', () => {
        let ssetConstructor, activePlugins, sset;
        const plugins = {
          a: {
            onAdd: (state, props) => {
              return props + 3;
            },
            onInit: jasmine.createSpy('a.onInit').and.returnValue(15),
            onDestroy: jasmine.createSpy('a.onDestroy'),
            onRemove: jasmine.createSpy('a.onRemove'),
            API: (state, props) => {
              return props * 2 + 1;
            }
          },
          b: {
            onAdd: jasmine.createSpy('b.onAdd'),
            onInit: jasmine.createSpy('b.onInit'),
            onDestroy: jasmine.createSpy('b.onDestroy'),
            onRemove: jasmine.createSpy('b.onRemove'),
            API: (state, props) => {
              return props;
            }
          }
        };
        spyOn(plugins.a, 'onAdd');

        expect(() => ssetConstructor = SSet.addPlugins(plugins)).not.toThrow();
        expect(() => activePlugins = ssetConstructor.getActivePlugins()).not.toThrow();
        expect(activePlugins).toEqual(plugins);

        expect(plugins.a.onAdd).not.toHaveBeenCalled();
        expect(plugins.a.onInit).not.toHaveBeenCalled();
        expect(plugins.a.onDestroy).not.toHaveBeenCalled();
        expect(plugins.a.onRemove).not.toHaveBeenCalled();
        expect(plugins.b.onAdd).not.toHaveBeenCalled();
        expect(plugins.b.onInit).not.toHaveBeenCalled();
        expect(plugins.b.onDestroy).not.toHaveBeenCalled();
        expect(plugins.b.onRemove).not.toHaveBeenCalled();

        /* onInit tests */
        expect(() => sset = ssetConstructor.fromArray([
          'abc', 'def', 'ghi'
        ], {b: 'computedBProperty'})).not.toThrow();
        expect(plugins.a.onInit).toHaveBeenCalledWith({
          '1c457260fe516c5ae59798a03f8382a9ba7657d4': 'abc',
          'ee916c381d09bae42f91773535f9b0b52a929cde': 'def',
          '83f89ad3d2cfac295ebbb8403ca9125c662193fc': 'ghi'
        }, undefined);
        expect(plugins.b.onInit).toHaveBeenCalledWith({
          '1c457260fe516c5ae59798a03f8382a9ba7657d4': 'abc',
          'ee916c381d09bae42f91773535f9b0b52a929cde': 'def',
          '83f89ad3d2cfac295ebbb8403ca9125c662193fc': 'ghi'
        }, 'computedBProperty');

        expect(sset.$('a')).toEqual(31);
        expect(sset.$('b')).toBeUndefined();
      })
    })
    describe('after SSet creation', () => {
      it('should allow creation', () => {
        let sset = SSet.fromArray([
          'America',
          'Europe',
          'Asia',
          'Africa',
          'Oceania'
        ], {
          a: true
        });

        const plugins = {
          a: {
            onAdd: (state, props) => {
              return props + 3;
            },
            onInit: jasmine.createSpy('a.onInit').and.returnValue(15),
            onDestroy: jasmine.createSpy('a.onDestroy'),
            onRemove: jasmine.createSpy('a.onRemove'),
            API: (state, props) => {
              return props * 2 + 1;
            }
          },
          b: {
            onAdd: jasmine.createSpy('b.onAdd'),
            onInit: jasmine.createSpy('b.onInit'),
            onDestroy: jasmine.createSpy('b.onDestroy'),
            onRemove: jasmine.createSpy('b.onRemove'),
            API: (state, props) => {
              return Object.keys(state).length;
            }
          }
        };

        expect(() => sset = sset.addPlugins(plugins)).not.toThrow();

        expect(plugins.a.onInit).toHaveBeenCalledWith({
          '28ba27e2192cf9ea56629ab6610392cc6941a36f': 'America',
          'b9e3f2ce2a69c0c200a58effe7b23b4caa085e7a': 'Europe',
          'dd3a8655b118b23c10df756af1b735df68715c41': 'Asia',
          '78fe0947ceb136858278dd9f3298bdbdc3f98f59': 'Africa',
          '6fa8cc138b46125ef27166d54afab767ad71e5c9': 'Oceania'
        }, true);
        expect(plugins.b.onInit).toHaveBeenCalledWith({
          '28ba27e2192cf9ea56629ab6610392cc6941a36f': 'America',
          'b9e3f2ce2a69c0c200a58effe7b23b4caa085e7a': 'Europe',
          'dd3a8655b118b23c10df756af1b735df68715c41': 'Asia',
          '78fe0947ceb136858278dd9f3298bdbdc3f98f59': 'Africa',
          '6fa8cc138b46125ef27166d54afab767ad71e5c9': 'Oceania'
        }, undefined);

        expect(sset.$('a')).toEqual(31);
        expect(sset.$('b')).toBe(5);

        expect(() => sset = sset.addPlugins({
          a: plugins.a
        })).toThrowError(`Could not add plugin to SSet: Plugin 'a' is already active`);

        expect(() => sset = sset.addPlugins(plugins)).toThrowError(`Could not add plugins to SSet: Plugins 'a, b' are already active`);

      })
    })

    it('should update plugin properties after adding new value to set', () => {
      let plugins = {
        isSizeEven: {
          onInit(state, props) {
            return Object.keys(state).length;
          },
          onAdd(item, hash, props, state) {
            return props + 1;
          },
          API(state, props) {
            return props % 2 === 0;
          }
        }
      };
      const onAddSpy = spyOn(plugins.isSizeEven, 'onAdd').and.callThrough();
      const onInitSpy = spyOn(plugins.isSizeEven, 'onInit').and.callThrough();

      let sset = SSet.addPlugins(plugins).fromArray(['a', 'b', 'c', 'd'])
      expect(onInitSpy.calls.count()).toBe(1);
      expect(sset.$('isSizeEven')).toBeTruthy();
      expect(onAddSpy.calls.count()).toBe(0);
      expect(() => sset = sset.merge('e')).not.toThrow();
      expect(plugins.isSizeEven.onAdd).toHaveBeenCalled();
      expect(onAddSpy.calls.count()).toBe(1);
      expect(sset.$('isSizeEven')).toBeFalsy();
      expect(() => sset = sset.merge('e')).not.toThrow();
      expect(onAddSpy.calls.count()).toBe(1);
      expect(() => sset = sset.merge('f')).not.toThrow();
      expect(onAddSpy.calls.count()).toBe(2);
      expect(() => sset = sset.merge('f')).not.toThrow();
      expect(onAddSpy.calls.count()).toBe(2);
    })

    it('should update plugin properties after removing value from set', () => {
      let plugins = {
        isSizeEvenV2: {
          onInit(state, props) {
            return Object.keys(state).length;
          },
          onRemove(item, hash, props, state) {
            return props - 1;
          },
          onAdd(item, hash, props, state) {
            return props + 1;
          },
          API(state, props) {
            return props % 2 === 0;
          }
        }
      };
      const onRemoveSpy = spyOn(plugins.isSizeEvenV2, 'onRemove').and.callThrough();

      let sset = SSet.addPlugins(plugins).fromArray(['a', 'b', 'c', 'd', 'e'])
      expect(sset.$('isSizeEvenV2')).toBeFalsy();

      expect(() => sset = sset.remove('e')).not.toThrow();
      expect(plugins.isSizeEvenV2.onRemove).toHaveBeenCalled();
      expect(onRemoveSpy.calls.count()).toBe(1);
      expect(sset.$('isSizeEvenV2')).toBeTruthy();

      expect(() => sset = sset.merge('e')).not.toThrow();
      expect(onRemoveSpy.calls.count()).toBe(1);
      expect(sset.$('isSizeEvenV2')).toBeFalsy();

      expect(() => sset = sset.remove('d')).not.toThrow();
      expect(onRemoveSpy.calls.count()).toBe(2);
      expect(sset.$('isSizeEvenV2')).toBeTruthy();

      expect(() => sset = sset.remove('c')).not.toThrow();
      expect(onRemoveSpy.calls.count()).toBe(3);
      expect(sset.$('isSizeEvenV2')).toBeFalsy();
    })

  })

  describe('hasHash', () => {
    it('contains hasHash method', () => {
      let sset = SSet.fromArray([
        'abc'
      ]);
      let hasHash;
      expect(() => hasHash = sset.hasHash(SSet.hashOf('abc'))).not.toThrow();
      expect(hasHash).toEqual(true)
      expect(() => hasHash = sset.hasHash('inexistentHash')).not.toThrow();
      expect(hasHash).toEqual(false);

    })
  })

  describe('getByHash', () => {
    it('should contain getByHash method', () => {
      let sset = SSet.fromArray([
        'abc'
      ]);
      let hashItem;
      expect(() => hashItem = sset.getByHash(SSet.hashOf('abc'))).not.toThrow();
      expect(hashItem).toEqual('abc')

      expect(() => sset.getByHash('inexistentHash')).toThrowError(`No item in the set corresponds to hash 'inexistentHash'`)
    })
  })

  describe('diff', () => {

    it('should contain changesTo method', () => {
      let sset = SSet.fromArray([1, 2, 3, 4]),
      sset2 = SSet.fromArray([5, 6, 7, 8]),
      changes;
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.from).toBe(sset);
      expect(changes.to).toBe(sset2);
      expect(changes.changes.union.toArray()).toEqual([6, 5, 8, 7]);
      expect(changes.changes.difference.toArray()).toEqual([2, 1, 3, 4]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([3, 4, 5, 6, 7]);
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.from).toBe(sset);
      expect(changes.to).toBe(sset2);
      expect(changes.changes.union.toArray()).toEqual([6, 7]);
      expect(changes.changes.difference.toArray()).toEqual([2, 1]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([4, 5]);
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.from).toBe(sset);
      expect(changes.to).toBe(sset2);
      expect(changes.changes.union.toArray()).toEqual([]);
      expect(changes.changes.difference.toArray()).toEqual([2, 1, 3]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([1, 2, 3, 4, 5]);
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.from).toBe(sset);
      expect(changes.to).toBe(sset2);
      expect(changes.changes.union.toArray()).toEqual([]);
      expect(changes.changes.difference.toArray()).toEqual([]);

      sset = SSet.fromArray([]);
      sset2 = SSet.fromArray([1, 2, 3, 4, 5]);
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.from).toBe(sset);
      expect(changes.to).toBe(sset2);
      expect(changes.changes.union.toArray()).toEqual([2, 1, 5, 3, 4]);
      expect(changes.changes.difference.toArray()).toEqual([]);

    })

    it('should contain changesFrom method', () => {
      let sset = SSet.fromArray([1, 2, 3, 4]),
      sset2 = SSet.fromArray([5, 6, 7, 8]),
      changes;
      expect(() => changes = sset.changesFrom(sset2)).not.toThrow();
      expect(changes.from).toBe(sset2);
      expect(changes.to).toBe(sset);
      expect(changes.changes.union.toArray()).toEqual([2, 1, 3, 4]);
      expect(changes.changes.difference.toArray()).toEqual([6, 5, 8, 7]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([3, 4, 5, 6, 7]);
      expect(() => changes = sset.changesFrom(sset2)).not.toThrow();
      expect(changes.from).toBe(sset2);
      expect(changes.to).toBe(sset);
      expect(changes.changes.union.toArray()).toEqual([2, 1]);
      expect(changes.changes.difference.toArray()).toEqual([6, 7]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([4, 5]);
      expect(() => changes = sset.changesFrom(sset2)).not.toThrow();
      expect(changes.from).toBe(sset2);
      expect(changes.to).toBe(sset);
      expect(changes.changes.union.toArray()).toEqual([2, 1, 3]);
      expect(changes.changes.difference.toArray()).toEqual([]);

      sset = SSet.fromArray([1, 2, 3, 4, 5]);
      sset2 = SSet.fromArray([1, 2, 3, 4, 5]);
      expect(() => changes = sset.changesFrom(sset2)).not.toThrow();
      expect(changes.from).toBe(sset2);
      expect(changes.to).toBe(sset);
      expect(changes.changes.union.toArray()).toEqual([]);
      expect(changes.changes.difference.toArray()).toEqual([]);

      sset = SSet.fromArray([]);
      sset2 = SSet.fromArray([1, 2, 3, 4, 5]);
      expect(() => changes = sset.changesFrom(sset2)).not.toThrow();
      expect(changes.from).toBe(sset2);
      expect(changes.to).toBe(sset);
      expect(changes.changes.union.toArray()).toEqual([]);
      expect(changes.changes.difference.toArray()).toEqual([2, 1, 5, 3, 4]);
    })

    it('should have applyChanges and revertChanges methods', () => {
      let sset = SSet.fromArray([1, 2, 5]),
      sset2 = SSet.fromArray([1, 2, 3, 4]),
      sset3,
      changes;
      expect(() => changes = sset.changesTo(sset2)).not.toThrow();
      expect(changes.changes.union.equals(SSet.fromArray([3, 4]))).toBeTruthy()
      expect(changes.changes.difference.equals(SSet.fromArray([5]))).toBeTruthy()
      expect(() => sset3 = sset.applyChanges(changes.changes)).not.toThrow();
      expect(sset3.equals(sset2)).toBeTruthy();

      expect(() => sset3 = sset3.revertChanges(changes.changes)).not.toThrow();
      expect(sset3.equals(sset)).toBeTruthy();

      expect(() => sset3 = sset3.revertChanges(changes.changes)).not.toThrow();
    })

  })
})
