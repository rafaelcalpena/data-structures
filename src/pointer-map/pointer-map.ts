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

  public toPairs() {
    const {state, items} = this.internal;
    const keys = Object.keys(state);
    return keys.map((key) => {
      return [key, state[key]];
    });
  }

}
