import _ = require("lodash");

type HashMadeMap = {
  [s: string] : string
}
type keyValuePair = [string, string];
type pairsArray = Array<keyValuePair>;


export class PointerMap {
  static fromObject(obj: HashMadeMap) {
    return new PointerMap({
      state: obj,
      props: {
        size: Object.keys(obj).length
      }
    });
  }

  static fromPairs(pairs: pairsArray) {
    let size = 0;
    let state = pairs.reduce((acc, pair) => {
      size += 1;
      if (pair[0] in acc){
        throw new Error(`Could not create PointerMap: Pairs contain duplicate key '${pair[0]}'`)
      }
      acc[pair[0]] = pair[1];
      return acc;
    }, {})
    return new PointerMap({
      state,
      props: {
        size
      }
    })
  }

  constructor(private internal) { }

  size() {
    return this.internal.props.size;
  }

  has(key: string, value?: string) {
    const {state} = this.internal;
    return (key in state) && (value ? state[key] === value : true);
  }

  add(key, value) {
    if (this.has(key)) {
      throw new Error(`Could not add to PointerMap: key '${key}' already exists`)
    }
    return new PointerMap({
      state: {
        ...this.internal.state,
        [key]: (typeof value !== 'undefined') ? value : true
      },
      props: {
        size: this.internal.props.size + 1
      }
    })
  }

  set(key, value) {
    const isOverwrite = this.has(key);
    return new PointerMap({
      state: {
        ...this.internal.state,
        [key]: value
      },
      props: {
        size: this.internal.props.size + (isOverwrite ? 0 : 1)
      }
    })
  }

  remove(key) {
    if (!this.has(key)) {
      throw new Error(`Could not remove from PointerMap: key '${key}' does not exist`)
    }
    return new PointerMap({
      state: _.omit(this.internal.state, [key]),
      props: {
        size: this.internal.props.size - 1
      }
    })
  }

  get(key) {
    if (!this.has(key)) {
      throw new Error(`Could not get from PointerMap: key '${key}' does not exist`)
    }
    return this.internal.state[key];
  }

  toObject() {
    return {...this.internal.state};
  }

  toPairs() {
    const {state, items} = this.internal;
    const keys = Object.keys(state);
    return keys.map((key) => {
      return [key, state[key]]
    })
  }

}
