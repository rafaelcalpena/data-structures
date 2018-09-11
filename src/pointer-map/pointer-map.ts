import _ = require('lodash');

interface IHashMadeMap {
  [s: string]: string;
}
type keyValuePair = [string, string];
type pairsArray = keyValuePair[];

export class PointerMap {
  public static fromObject(obj: IHashMadeMap) {
    return new PointerMap({
      props: {
        size: Object.keys(obj).length,
      },
      state: obj,
    });
  }

  public static keyInEvery(key, pointerMaps) {
    return pointerMaps.reduce((acc, pointerMap) => {
      if (acc === false) {
        return false;
      }
      return pointerMap.has(key);
    }, true);
  }

  public static fromPairs(pairs: pairsArray) {
    let size = 0;
    const state = pairs.reduce((acc, pair) => {
      size += 1;
      if (pair[0] in acc) {
        throw new Error(`Could not create PointerMap: Pairs contain duplicate key '${pair[0]}'`);
      }
      acc[pair[0]] = pair[1];
      return acc;
    }, {});
    return new PointerMap({
      props: {
        size,
      },
      state,
    });
  }

  constructor(private internal) { }

  public size() {
    return this.internal.props.size;
  }

  public has(key: string, value?: string) {
    const {state} = this.internal;
    return (key in state) && (value ? state[key] === value : true);
  }

  public add(key, value) {
    if (this.has(key)) {
      throw new Error(`Could not add to PointerMap: key '${key}' already exists`);
    }
    return new PointerMap({
      props: {
        size: this.internal.props.size + 1,
      },
      state: {
        ...this.internal.state,
        [key]: (typeof value !== 'undefined') ? value : true,
      },
    });
  }

  public set(key, value) {
    const isOverwrite = this.has(key);
    return new PointerMap({
      props: {
        size: this.internal.props.size + (isOverwrite ? 0 : 1),
      },
      state: {
        ...this.internal.state,
        [key]: value,
      },
    });
  }

  public remove(key) {
    if (!this.has(key)) {
      throw new Error(`Could not remove from PointerMap: key '${key}' does not exist`);
    }
    return new PointerMap({
      props: {
        size: this.internal.props.size - 1,
      },
      state: _.omit(this.internal.state, [key]),
    });
  }

  public get(key) {
    if (!this.has(key)) {
      throw new Error(`Could not get from PointerMap: key '${key}' does not exist`);
    }
    return this.internal.state[key];
  }

  public toObject() {
    return {...this.internal.state};
  }

  public keysIntersection(...pointerMaps) {
    pointerMaps = [this, ...pointerMaps];
    const smallest = pointerMaps.reduce((acc, p) => {
      return (p.size() < acc.size) ? {
        item: p,
        size: p.size(),
      } : acc;
    }, {
      item: -1,
      size: Infinity,
    });

    return smallest.item.filter((i) => {
      /* check if every pointerMaps has key */
      return PointerMap.keyInEvery(i, pointerMaps);
    }, true);

  }

  public filter(fn, clearValues?) {
    let result = PointerMap.fromObject({});
    /* TODO: Memoize object keys */
    Object.keys(this.internal.state).forEach((k) => {
      if (fn(k) === true) {
        result = result.add(k, clearValues ? true : this.internal.state[k]);
      }
    });
    return result;
  }

  public firstKey() {
    const {state} = this.internal;
    let result;
    _.forEach(state, (value, key) => {
      result = key;
      return false;
    });
    return result;
  }

  public toPairs() {
    const {state, items} = this.internal;
    const keys = Object.keys(state);
    return keys.map((key) => {
      return [key, state[key]];
    });
  }

  public reduce(fn: (acc, value, key) => any, acc: any) {
    const {state} = this.internal;
    return Object.keys(state).reduce(
      (a, key) => fn(a, state[key], key),
      acc);
  }

}
