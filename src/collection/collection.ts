import {SSet} from '../sset/sset'

import _ = require("lodash");
import {createTriples} from './create-triples'
import {PointerMap} from '../pointer-map/pointer-map'
import {DefaultIndex} from '../default-index/default-index'

export const indexPlugin = {
  onInit(state) {
    /* For each item created, update indexes */
    const itemHashes = Object.keys(state).map(
      h => ({hash: h, item: state[h]})
    );
    const triples = itemHashes.reduce(createTriples, []);
    return DefaultIndex.fromTriples(
      triples
    );
  },
  onRemove(item, itemHash, props, state) {
    let defaultIndex = props;
    /* TODO: foreach keys */
    defaultIndex = _.reduce(item, (acc, value, key) => {
      return acc.remove(key, SSet.hashOf(value), itemHash);
    }, defaultIndex)
    return defaultIndex;
  },
  onAdd(item, itemHash, props, state) {
    let defaultIndex = props;
    /* TODO: foreach keys */
    defaultIndex = _.reduce(item, (acc, value, key) => {
      return acc.add(key, SSet.hashOf(value), itemHash);
    }, defaultIndex)
    return defaultIndex;
  },
  API(state, props: DefaultIndex) {
    return {
      findOne(query) {
        /* TODO: separate props in indexed and not-indexed */
        if (_.isPlainObject(query)) {
          /* Run sub-queries for each property key */
          let results : PointerMap[] = _.reduce(
            query,
            (result, value, propName) => {
              let args = [propName, SSet.hashOf(value)];
              return [
                ...result,
                props.has(args[0], args[1]) ?
                  props.from(args[0], args[1]) :
                  PointerMap.fromObject({})
              ]
            },
            []
          )
          let firstKey;
          if (results.length > 1) {
            firstKey = results[0].keysIntersection(...results.slice(1)).firstKey();
          }
          else {
            firstKey = results[0].firstKey()
          }
          return state[firstKey]
        }
      },

      find(query) {
        /* TODO: refactor/simplify with findOne */
        if (_.isPlainObject(query)) {
          /* Run sub-queries for each property key */
          let results : PointerMap[] = _.reduce(
            query,
            (result, value, propName) => {
              let args = [propName, SSet.hashOf(value)];
              return [
                ...result,
                props.has(args[0], args[1]) ?
                  props.from(args[0], args[1]) :
                  PointerMap.fromObject({})
              ]
            },
            []
          )
          let result;
          if (results.length > 1) {
            result = results[0].keysIntersection(...results.slice(1));
          }
          else {
            result = results[0]
          }
          result = result.toPairs().map(([k]) => state[k]);
          return Collection.fromArray(result);
        }
      }
    }
  }
}

type InternalState = {
  set: SSet
}

export class Collection {
  static fromArray(items) {
    const set = SSet.addPlugins({indexPlugin}).fromArray(items);

    return new Collection({
      set: set
    })
  }

  findOne(query) {
    return this.internal.set.$('indexPlugin').findOne(query);
  }

  find(query) {
    return this.internal.set.$('indexPlugin').find(query);
  }

  add(item) {
    const newSet = this.internal.set.add(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet
      }
    )
  }

  merge(item) {
    const newSet = this.internal.set.merge(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet
      }
    )
  }

  union(collection: Collection) {
    let {set} = collection.internal;
    const newSet = this.internal.set.union(set);
    return new Collection(
      {
        ...this.internal,
        set: newSet
      }
    )
  }

  has(item) {
    return this.internal.set.has(item);
  }

  remove(item) {
    const newSet = this.internal.set.remove(item);
    return new Collection(
      {
        ...this.internal,
        set: newSet
      }
    )
  }

  /** Iterate over SSet using for ... of loops */
  public [Symbol.iterator]() {
    return this.internal.set[Symbol.iterator]();
  }

  public map(fn) {
    return new Collection({
      ...this.internal,
      set: this.internal.set.map(fn)
    });
  }

  constructor(private internal: InternalState) { }

  size() {
    return this.internal.set.size();
  }

  toArray() {
    return this.internal.set.toArray();
  }
}
