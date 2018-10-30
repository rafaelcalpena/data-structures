import {MultiMap} from '../multi-map/multi-map';
import {PointerMap} from '../pointer-map/pointer-map';

type triplesType = [string, string, string];

type orderedTriplesArray = any[];

interface IMultiMapRemoveManyQuery {
  [s: string]: string[];
}

interface IDefaultIndexRemoveManyQuery {
  [s: string]: IMultiMapRemoveManyQuery;
}

type separatedFirstKeys = (i: string) => [string, IMultiMapRemoveManyQuery];

/* TODO: Generalize for n dimensions */
export class DefaultIndex {

  public static fromTriples(triples: triplesType[]): DefaultIndex {
    /* The internal state is composed of a PointerMap with
    nested MultiMaps */
    let outerMap = PointerMap.fromObject({});
    outerMap = triples.reduce(
      (acc, t) => {
        if (!acc.has(t[0])) {
          acc = acc.add(t[0], MultiMap.fromPairs([[]]));
        }
        const innerMap = acc.get(t[0]);
        if (innerMap.has(t[1], t[2])) {
          throw new Error(
            `Could not add to DefaultIndex: path '${t.join(', ')}' already exists`,
          );
        }
        const newInnerMap = innerMap.add(t[1], t[2]);
        const newOuterMap = acc.set(t[0], newInnerMap);
        return newOuterMap;
      },
      outerMap,
    );
    return new DefaultIndex(outerMap);
  }
  constructor(public internal: PointerMap) { }

  public toObject() {
    return this.internal.reduce((acc, value, key) => {
      return {
        ...acc,
        [key]: value.toObject(),
      };
    }, {});
  }

  public has(propName, valueHash?, ref?) {
    return this.internal.has(propName) && (
      typeof valueHash !== 'undefined' ?
        this.internal.get(propName).has(valueHash, ref) :
        true
    );
  }

  public get(propName, valueHash) {
    return (valueHash !== undefined) ?
      this.internal.get(propName).getOne(valueHash) :
      this.internal.get(propName);
  }

  public from(propName, valueHash?) {
    if (this.internal.has(propName)) {
      const firstLevel = this.internal.get(propName);
      if (typeof valueHash !== 'undefined') {
        if (firstLevel.has(valueHash)) {
          return firstLevel.from(valueHash);
        }
        throw new Error(
          `Could not read from DefaultIndex: path ` +
          `'${propName} -> ${valueHash}' does not exist`,
        );
      }
      return firstLevel;
    }
    throw new Error(
      `Could not read from DefaultIndex: key '${propName}' does not exist`,
    );
  }

  public add(k1, k2, k3) {
    let acc = this.internal;
    if (!acc.has(k1)) {
      acc = acc.add(k1, MultiMap.fromPairs([[]]));
    }
    const innerMap = acc.get(k1);
    if (innerMap.has(k2, k3)) {
      throw new Error(
        `Could not add to DefaultIndex: path '${[k1, k2, k3].join(', ')}' already exists`,
      );
    }
    const newInnerMap = innerMap.add(k2, k3);
    const newOuterMap = acc.set(k1, newInnerMap);
    return new DefaultIndex(newOuterMap);
  }

  public remove(k1, k2, k3) {
    return this.removeMany([[k1, k2, k3]]);
  }

  public orderTriples(items: string[][]): IDefaultIndexRemoveManyQuery {
    /* Using mutable for performance improvement */
    const acc = {};
    items.forEach((item: string[]) => {
      acc[item[0]] = acc[item[0]] || {};
      acc[item[0]][item[1]] = acc[item[0]][item[1]] || [];
      acc[item[0]][item[1]].push(item[2]);
    });
    return acc;
  }

  public removeMany(items: string[][]) {

    /* Separate subKeys by same first key*/
    const ordered = this.orderTriples(items);
    let outerMap = this.internal;
    const keys = Object.keys(ordered);
    const removeKeys = [];
    const setKeys = {};

    const errorMsg = (k1, k2, k3) => `Could not remove from DefaultIndex: ` +
          `path '${[k1, k2, k3].join(', ')}' does not exist`;

    const checkIfValid = ([k1, k2, k3]) => {

      if (!outerMap.has(k1)) {
        throw new Error(errorMsg(k1, k2, k3));
      }
      const innerMap = outerMap.get(k1);
      if (!innerMap.has(k2, k3)) {
        throw new Error(errorMsg(k1, k2, k3));
      }
    };

    items.forEach(checkIfValid);

    const separateFirstKeys: separatedFirstKeys = (i) => [i, ordered[i]];
    const orderedArray: orderedTriplesArray = keys.map(separateFirstKeys);

    /* Loop through first keys and update them respectively */
    type removeInnerKeysType = (a: [string, IMultiMapRemoveManyQuery]) => void;
    const removeInnerKeys: removeInnerKeysType = ([key, inner]) => {
      let innerMap: MultiMap = outerMap.get(key);
      innerMap = innerMap.removeMany(inner);
      if (innerMap.size() === 0) {
        removeKeys.push(key);
      } else {
        setKeys[key] = innerMap;
      }
    };
    orderedArray.forEach(removeInnerKeys);

    outerMap = outerMap.removeMany(removeKeys).setMany(setKeys);

    return new DefaultIndex(outerMap);
  }
}
