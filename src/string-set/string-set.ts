import _ = require('lodash');
import {PointerMap} from '../pointer-map/pointer-map';

interface StringSetInternal {
  state: PointerMap;
  props?: any;
}

interface StringSetObject {
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
  constructor(private internal: StringSetInternal) {}

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
      throw new Error(`Could not remove '${item}' from StringSet: Item does not exist`);
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

  public toObject(): StringSetObject {
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
