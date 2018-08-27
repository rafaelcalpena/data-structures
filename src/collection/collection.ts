import {SSet} from '../sset/sset';

import _ = require("lodash");
import {DefaultIndex} from '../default-index/default-index';
import {PointerMap} from '../pointer-map/pointer-map';
import {createTriples} from './create-triples';

export const indexPlugin = {
  onInit(state) {
    /* For each item created, update indexes */
    const itemHashes = Object.keys(state).map(
      (h) => ({hash: h, item: state[h]}),
    );
    const triples = itemHashes.reduce(createTriples, []);
    return DefaultIndex.fromTriples(
      triples,
    );
  },
  onRemove(item, itemHash, props, state) {
    let defaultIndex = props;
    /* TODO: foreach keys */
    defaultIndex = _.reduce(item, (acc, value, key) => {
      return acc.remove(key, SSet.hashOf(value), itemHash);
    }, defaultIndex);
    return defaultIndex;
  },
  onAdd(item, itemHash, props, state) {
    let defaultIndex = props;
    /* TODO: foreach keys */
    defaultIndex = _.reduce(item, (acc, value, key) => {
      return acc.add(key, SSet.hashOf(value), itemHash);
    }, defaultIndex);
    return defaultIndex;
  },
  API(state, props: DefaultIndex) {
    return {
      findOne(query) {
        /* TODO: separate props in indexed and not-indexed */
        if (_.isPlainObject(query)) {
          /* Run sub-queries for each property key */
          const results: PointerMap[] = _.reduce(
            query,
            (result, value, propName) => {
              const args = [propName, SSet.hashOf(value)];
              return [
                ...result,
                props.has(args[0], args[1]) ?
                  props.from(args[0], args[1]) :
                  PointerMap.fromObject({}),
              ];
            },
            [],
          );
          let firstKey;
          if (results.length > 1) {
            firstKey = results[0].keysIntersection(...results.slice(1)).firstKey();
          } else {
            firstKey = results[0].firstKey();
          }
          return state[firstKey];
        }
      },

      find(query) {
        /* TODO: refactor/simplify with findOne */
        if (_.isPlainObject(query)) {
          /* Run sub-queries for each property key */
          const results: PointerMap[] = _.reduce(
            query,
            (r, value, propName) => {
              const args = [propName, SSet.hashOf(value)];
              return [
                ...r,
                props.has(args[0], args[1]) ?
                  props.from(args[0], args[1]) :
                  PointerMap.fromObject({}),
              ];
            },
            [],
          );
          let result;
          if (results.length > 1) {
            result = results[0].keysIntersection(...results.slice(1));
          } else {
            result = results[0];
          }
          result = result.toPairs().map(([k]) => state[k]);
          return Collection.fromArray(result);
        }
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

  public findOne(query) {
    return this.internal.set.$('indexPlugin').findOne(query);
  }

  public find(query) {
    return this.internal.set.$('indexPlugin').find(query);
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
    return new Collection(
      {
        ...this.internal,
        set: newSet,
      },
    );
  }

  public has(item) {
    return this.internal.set.has(item);
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

  public size() {
    return this.internal.set.size();
  }

  public toArray() {
    return this.internal.set.toArray();
  }
}
