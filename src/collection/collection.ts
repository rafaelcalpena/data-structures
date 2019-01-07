import {SSet} from '../sset/sset';

import _ = require("lodash");
import * as uuid from 'uuid/v4';
import {DefaultIndex} from '../default-index/default-index';
import {StringSet} from '../pointer-map/pointer-map';
import {createTriples} from './create-triples';

const performIndexLookup = (args, props) => {
  return props.index.has(args[0], args[1]) ?
  props.index.from(args[0], args[1]) :
  StringSet.fromEmpty();
};

const orOperator = (propName, values, props) => {
  const sets = values.reduce((acc, v) => {
    return [
      ...acc,
      performIndexLookup([propName, v], props),
    ];
  }, []);
  /* Perform union between StringSets */
  const finalStringSet = sets[0] ?
  sets[0].union(...sets.splice(1)) :
   StringSet.fromEmpty();
  return finalStringSet;
};

export const indexPlugin = {
  onInit(state) {
    /* TODO: Abstract id verification and creation from
    onInit and onBeforeAdd into single function */
    /* Add ids to items that do not have it */
    state = _.reduce(state, (acc, value, key) => {

      if (!_.isPlainObject(value)) {
        throw new Error(`All items within a Collection must be plain objects`);
      }

      /* Hash key must change due to id insertion */
      if (!('id' in value)) {
        const newObj = {
          ...value,
          id: uuid(),
        };
        return _.omit({
          ...acc,
          [SSet.hashOf(newObj)]: newObj,
        }, [key]);
      }
      return {
        ...acc,
        [key]: value,
      };
    }, {});
    /* For each item created, update indexes */
    const itemHashes = Object.keys(state).map(
      (h) => ({hash: h, item: state[h]}),
    );
    const triples = itemHashes.reduce(createTriples, []);

    return {
      props: {
        index: DefaultIndex.fromTriples(
          triples,
        ),
        /* TODO: Use pointerMap with nested pointerMaps for inverse.
        There is no need for multiple values in this case */
        inverse: DefaultIndex.fromTriples(
          triples.map((triple) => [triple[2], triple[0], triple[1]]),
        ),
      },
      state,
    };
  },
  onRemove(items, itemHashes, props, state) {
    /* TODO: foreach keys */
    const result = {
      index: [],
      inverse: [],
    };
    items.forEach((item, i) => {
      const itemHash = itemHashes[i];
      _.forEach(item, (value, key) => {
       const valueHash = props.inverse.get(itemHash, key);
       const indexPath = [key, valueHash, itemHash];
       const inversePath = [itemHash, key, valueHash];
       /* Using mutable for performance improvement */
       result.index.push(indexPath);
       result.inverse.push(inversePath);
     });

    });

    return {
      index: props.index.removeMany(result.index),
      inverse: props.inverse.removeMany(result.inverse),
    };
  },
  onBeforeAdd(items, itemHashes, props: DefaultIndex, state) {
    let result;
    items.forEach((item) => {
      if (!item.id) {
        result = {
          continue: true,
          message: null,
          value: {
            ...item,
            id: uuid(),
          },
        };
      } else {
        result = {
          continue: true,
          message: null,
          value: item,
        };
      }
    });

    return result;
  },
  onAdd(items, itemHashes, props, state) {
    /* TODO: foreach keys */
    let result = props;
    items.forEach((item, i) => {
      const itemHash = itemHashes[i];
      result = _.reduce(item, (acc, value, key) => {
        const valueHash = SSet.hashOf(value);
        const newIndex = acc.index.add(key, valueHash, itemHash);
        const newInverse = acc.inverse.add(itemHash, key, valueHash);
        return {
          index: newIndex,
          inverse: newInverse,
        };
      }, result);
    });

    return result;
  },
  API(state, props, set, [collection]) {
    return {
      findOne(query) {
      /* TODO: separate props in indexed and not-indexed */
        /* Run sub-queries for each property key */
        const results: StringSet[] = _.reduce(
          query,
          (result, value, propName) => {
            const args = [propName, SSet.hashOf(value)];
            return [
              ...result,
              props.index.has(args[0], args[1]) ?
                props.index.from(args[0], args[1]) :
                StringSet.fromEmpty(),
            ];
          },
          [],
        );
        let firstKey: string;
        if (results.length > 1) {
          firstKey = results[0].intersection(...results.slice(1)).first();
        } else {
          firstKey = results[0].first();
        }
        return state[firstKey];
      },

      findOneHashOrigin(query) {
          const results: StringSet[] = _.reduce(
            query,
            (result, value, propName) => {
              const args = [propName, value];
              return [
                ...result,
                props.index.has(args[0], args[1]) ?
                  props.index.from(args[0], args[1]) :
                  StringSet.fromEmpty(),
              ];
            },
            [],
          );
          let firstKey;
          if (results.length > 1) {
            firstKey = results[0].intersection(...results.slice(1)).first();
          } else {
            firstKey = results[0].first();
          }
          return firstKey;
      },

      findOneHash(query) {
      /* TODO: separate props in indexed and not-indexed */
        /* Run sub-queries for each property key */
        const results: StringSet[] = _.reduce(
          query,
          (result, value, propName) => {
            const args = [propName, value];
            return [
              ...result,
              props.index.has(args[0], args[1]) ?
                props.index.from(args[0], args[1]) :
                StringSet.fromEmpty(),
            ];
          },
          [],
        );
        let firstKey;
        if (results.length > 1) {
          firstKey = results[0].intersection(...results.slice(1)).first();
        } else {
          firstKey = results[0].first();
        }
        return state[firstKey];
      },

      find(query): Collection {
        /* TODO: refactor/simplify with findOne */
        /* Run sub-queries for each property key */
        const results: StringSet[] = _.reduce(
          query,
          (r, value, propName) => {
            const args = [propName, SSet.hashOf(value)];
            return [
              ...r,
              props.index.has(args[0], args[1]) ?
                props.index.from(args[0], args[1]) :
                StringSet.fromEmpty(),
            ];
          },
          [],
        );
        let result;
        if (results.length > 1) {
          result = results[0].intersection(...results.slice(1));
        } else {
          result = results[0];
        }
        return collection.filterHashes(result);
      },

      findHash(query): Collection {
        /* TODO: refactor/simplify with findOne */
        /* Run sub-queries for each property key */
        const results: StringSet[] = _.reduce(
          query,
          (r, value, propName) => {
            /* arrays work as "OR" clause */
            /* TODO: Add tests */
            if (_.isArray(value)) {
              return [
                ...r,
                orOperator(propName, value, props),
              ];
            } else {
            const args = [propName, value];
            return [
              ...r,
              props.index.has(args[0], args[1]) ?
                props.index.from(args[0], args[1]) :
                StringSet.fromEmpty(),
            ];
            }
          },
          [],
        );
        let result: StringSet;
        if (results.length > 1) {
          result = results[0].intersection(...results.slice(1));
        } else {
          result = results[0];
        }
        return collection.filterHashes(result);
      },

      getIndex() {
        return props.index;
      },

      getMetadata() {
        return props.inverse;
      },

    };
  },
};

interface InternalState {
  set: SSet;
}

export class Collection {
  public static fromArray(items) {
    const set = SSet.addPlugins({indexPlugin}).fromArray(items);

    return new Collection({
      set,
    });
  }

  constructor(private internal: InternalState) { }

  public filterHashes(hashes: StringSet): Collection {
    return this.filter((item, hash) => hashes.has(hash));
  }

  public findOne(query) {
    return this.internal.set.$('indexPlugin', [this]).findOne(query);
  }

  public findOneHash(query) {
    return this.internal.set.$('indexPlugin', [this]).findOneHash(query);
  }

  public findOneHashOrigin(query) {
    return this.internal.set.$('indexPlugin', [this]).findOneHashOrigin(query);
  }

  public find(query) {
    return this.internal.set.$('indexPlugin', [this]).find(query);
  }

  public findHash(query) {
    return this.internal.set.$('indexPlugin', [this]).findHash(query);
  }

  public add(item) {
    const newSet = this.internal.set.add(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public merge(item) {
    const newSet = this.internal.set.merge(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public union(collection: Collection) {
    const {set} = collection.internal;
    const newSet = this.internal.set.union(set);
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public difference(collection: Collection) {
    const {set} = collection.internal;
    const newSet = this.internal.set.difference(set);
    /* Performance improvement */
    if (newSet === this.internal.set) {
      return this;
    }
    return new Collection(
      {
        set: newSet,
      },
    );
  }

  public has(item) {
    return this.internal.set.has(item);
  }

  public isEmpty(): any {
    return this.size() === 0;
  }

  public remove(item) {
    const newSet = this.internal.set.remove(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public removeHash(item) {
    return this.removeHashes([item]);
  }

  public removeHashes(item) {
    const newSet = this.internal.set.removeHashes(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public getOne() {
    return this.internal.set.getOne();
  }

  /** Iterate over SSet using for ... of loops */
  public [Symbol.iterator]() {
    return this.internal.set[Symbol.iterator]();
  }

  public map(fn) {
    return new Collection({
      ...this.internal,
      set: this.internal.set.map(fn),
    });
  }

  public forEach(fn) {
    /* For collection, item metadata is included by default */
    this.internal.set.forEach((item, hash) => {
      const metadata = this.getMetadata().get(hash);
      fn(item, hash, metadata);
    });
  }

  public filter(fn) {
    /* For collection, item metadata is included by default */
    return new Collection({
      ...this.internal,
      set: this.internal.set.filter((item, hash) => {
        const metadata = this.getMetadata().get(hash);
        return fn(item, hash, metadata);
      }),
    });
  }

  public size() {
    return this.internal.set.size();
  }

  public toArray() {
    return this.internal.set.toArray();
  }

  public getByHash(hash) {
    return this.internal.set.getByHash(hash);
  }

  public getByIdHash(hash) {
    return this.internal.set.getByHash(
      this.internal.set.$('indexPlugin').getIndex().get('id', hash),
    );
  }

  public getIndex() {
    return this.internal.set.$('indexPlugin').getIndex();
  }

  public getMetadata() {
    return this.internal.set.$('indexPlugin').getMetadata();
  }

  public changesFrom(c2: Collection) {
    return c2.changesTo(this);
  }

  public changesTo(c2: Collection) {
    let changesList = Collection.fromArray([]);
    let comparingCollection = c2;
    const removeItems = [];
    /* Algorithm should track items by 'id' property */
    this.forEach((item, hash, metadata) => {
      const id = item.id;
      /* TODO: Create wrapper for info */
      const c2Item = comparingCollection.findOneHash({
        id: metadata.getOne('id'),
      });
      const c2ItemHash = comparingCollection.findOneHashOrigin({
        id: metadata.getOne('id'),
      });
      if (c2Item) {
        /* TODO: Avoid rehashing to improve performance */
        if (c2ItemHash !== hash) {
          changesList = changesList.add({
            after: c2Item,
            before: item,
            id,
            type: 'edit',
          });
        }
        removeItems.push(c2ItemHash);
      } else {
        changesList = changesList.add({
          id,
          item,
          type: 'remove',
        });
      }
    });
    comparingCollection = comparingCollection.removeHashes(removeItems);
    comparingCollection.forEach((item) => {
      const id = item.id;
      changesList = changesList.add({
        id,
        item,
        type: 'add',
      });
    });

    return changesList;
  }
}
