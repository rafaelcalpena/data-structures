import {SSet} from '../sset/sset';

import _ = require("lodash");
import * as uuid from 'uuid/v4';
import {DefaultIndex} from '../default-index/default-index';
import {PointerMap} from '../pointer-map/pointer-map';
import {createTriples} from './create-triples';

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
      props: DefaultIndex.fromTriples(
      triples,
      ),
      state,
    };
  },
  onRemove(item, itemHash, props, state) {
    let defaultIndex = props;
    /* TODO: foreach keys */
    defaultIndex = _.reduce(item, (acc, value, key) => {
      return acc.remove(key, SSet.hashOf(value), itemHash);
    }, defaultIndex);
    return defaultIndex;
  },
  onBeforeAdd(item, itemHash, props: DefaultIndex, state) {
    if (!item.id) {
      return {
        continue: true,
        message: null,
        value: {
          ...item,
          id: uuid(),
        },
      };
    }
    return {
      continue: true,
      message: null,
      value: item,
    };
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
      },

      find(query) {
        /* TODO: refactor/simplify with findOne */
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
      },

      getIndex() {
        return props;
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
    /* Performance improvement */
    if (newSet === this.internal.set) {
      return this;
    }
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
    this.internal.set.forEach(fn);
  }

  public filter(fn) {
    return new Collection({
      set: this.internal.set.filter(fn),
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

  public changesFrom(c2: Collection) {
    return c2.changesTo(this);
  }

  public changesTo(c2: Collection) {
    let changesList = Collection.fromArray([]);
    let comparingCollection = c2;
    /* Algorithm should track items by 'id' property */
    this.forEach((item) => {
      const id = item.id;
      const c2Item = comparingCollection.findOne({id});
      if (c2Item) {
        /* TODO: Avoid rehashing to improve performance */
        if (SSet.hashOf(c2Item) !== SSet.hashOf(item)) {
          changesList = changesList.add({
            after: c2Item,
            before: item,
            id,
            type: 'edit',
          });
        }
        comparingCollection = comparingCollection.remove(c2Item);
      } else {
        changesList = changesList.add({
          id,
          item,
          type: 'remove',
        });
      }
    });
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
