import * as _ from 'lodash';

interface IStringSetInternal {
  state: PointerMap;
  props?: any;
}

interface IStringSetObject {
  [s: string]: true;
}

export class StringSet {

  public static fromEmpty(): StringSet {
    return new StringSet({
      state: PointerMap.fromObject({}),
    });
  }

  public static fromArray(array: string[]): StringSet {
    const newArray: Array<[string, boolean]> = array.map((item: string): [string, boolean] => [item, true]);
    return new StringSet({
      state: PointerMap.fromPairs(newArray),
    });
  }
  constructor(private internal: IStringSetInternal) {}

  public add(item: string): StringSet {

    if (this.internal.state.has(item)) {
      throw new Error(`Could not add '${item}' to StringSet: Item already exists`);
    }

    return new StringSet({
      state: this.internal.state.add(item, true),
    });
  }

  public merge(item: string): StringSet {

    if (this.internal.state.has(item)) {
      return this;
    }

    return new StringSet({
      state: this.internal.state.add(item, true),
    });
  }

  public isEmpty(): boolean {
    return this.internal.state.isEmpty();
  }

  public size(): number {
    return this.internal.state.size();
  }

  public has(item: string): boolean {
    return this.internal.state.has(item);
  }

  public remove(item: string): StringSet {

    if (!this.internal.state.has(item)) {
      throw new Error(`Could not remove from StringSet: item '${item}' does not exist`);
    }

    return new StringSet({
      state: this.internal.state.remove(item),
    });
  }

  public removeMany(items: string[]): StringSet {
    return new StringSet({
      state: this.internal.state.removeMany(items),
    });
  }

  public intersection(...args: StringSet[]): StringSet {
    return this.internal.state.keysIntersection(...args.map((a) => a.asPointerMap()));
  }

  public filter(fn: (item: string) => boolean): StringSet {
    return new StringSet({
      state: this.internal.state.filter(fn),
    });
  }

  public forEach(fn: (item: string) => void): void {
    this.internal.state.forEach(fn);
  }

  public toObject(): IStringSetObject {
    return this.internal.state.toObject();
  }

  public union(...args): StringSet {
    return new StringSet({
      state: this.internal.state.keysUnion(...args),
    });
  }

  public first(): string {
    return this.internal.state.firstKey();
  }

  public toArray(): string[] {
    return this.internal.state.keysArray();
  }

  public asPointerMap() {
    return this.internal.state;
  }
}

interface IHashMadeMap {
  [s: string]: string;
}
type keyValuePair = [string, (string| boolean)];
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
    const result = pointerMaps.reduce((acc, pointerMap) => {
      if (acc === false) {
        return false;
      }
      return pointerMap.has(key);
    }, true);
    return result;
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

  public isEmpty() {
    return this.size() === 0;
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

  public keysUnion(...pointerMaps): PointerMap {
    const result = pointerMaps.reduce((acc, p) => {
      let r = acc;
      p.forEach((key, value) => {
        /* TODO: Implement merge */
        if (!r.has(key)) {
          r = r.add(key, value);
        }
      });
      return r;
    }, this);

    return result;
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

  public setMany(items: {[s: string]: any}) {
    const newState = {
      ...this.internal.state,
    };
    let size = this.internal.props.size;

    _.forEach(items, (value, key) => {
      const isOverwrite = this.has(key);
      size += (isOverwrite ? 0 : 1);
      newState[key] = value;
    });

    return new PointerMap({
      props: {
        size,
      },
      state: newState,
    });
  }

  public remove(key) {
    return this.removeMany([key]);
  }

  public removeMany(keys: string[]) {
    const newState = Object.assign({}, this.internal.state);

    keys.forEach((key) => {
      if (!this.has(key)) {
        throw new Error(`Could not remove from PointerMap: key '${key}' does not exist`);
      }
      delete newState[key];
    });
    return  new PointerMap({
      props: {
        size: this.internal.props.size - keys.length,
      },
      state: newState,
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

  public keysIntersection(...pointerMaps: PointerMap[]): StringSet {
    pointerMaps = [this, ...pointerMaps];
    const smallest = pointerMaps.reduce((acc, p) => {
      return (p.size() < acc.size) ? {
        item: p,
        size: p.size(),
      } : acc;
    }, {
      item: null,
      size: Infinity,
    });

    return smallest.item.reduce((acc, value, i) => {
      /* check if every pointerMaps has key */
      return PointerMap.keyInEvery(i, pointerMaps) ? acc.add(i) : acc;
    }, StringSet.fromEmpty());

  }

  public filter(fn, clearValues?) {
    let result = PointerMap.fromObject({});
    /* TODO: Memoize object keys */
    this.forEach((k) => {
      if (fn(k) === true) {
        result = result.add(k, clearValues ? true : this.internal.state[k]);
      }
    });
    return result;
  }

  public forEach(fn) {
    Object.keys(this.internal.state).forEach((key) => fn(key, this.internal.state[key]));
  }

  public firstKey(): string {
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

  public keysArray(): string[] {
    const {state, items} = this.internal;
    const keys = Object.keys(state);
    return keys;
  }

  public keysSet(): StringSet {
    return StringSet.fromArray(this.keysArray());
  }

  public reduce(fn: (acc, value, key) => any, acc: any) {
    const {state} = this.internal;
    return Object.keys(state).reduce(
      (a, key) => fn(a, state[key], key),
      acc);
  }

}
