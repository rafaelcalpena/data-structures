import {PointerMap} from '../pointer-map/pointer-map'
import {MultiMap} from '../multi-map/multi-map'

type triplesType = [string, string, string];

/* TODO: Generalize for n dimensions */
export class DefaultIndex {
  constructor (public internal: PointerMap) { }

  static fromTriples (triples: triplesType[]) : DefaultIndex {
    /* The internal state is composed of a PointerMap with
    nested MultiMaps */
    let outerMap = PointerMap.fromObject({});
    outerMap = triples.reduce(
      (acc, t) => {
        if(!acc.has(t[0])) {
          acc = acc.add(t[0], MultiMap.fromPairs([[]]));
        }
        let innerMap = acc.get(t[0]);
        if (innerMap.has(t[1], t[2])) {
          throw new Error(
            `Could not add to DefaultIndex: path '${t.join(', ')}' already exists`
          )
        }
        let newInnerMap = innerMap.add(t[1], t[2]);
        let newOuterMap = acc.set(t[0], newInnerMap);
        return newOuterMap;
      },
      outerMap
    );
    return new DefaultIndex(outerMap)
  }

  toObject() {
    return this.internal.reduce((acc, value, key) => {
      return {
        ...acc,
        [key]: value.toObject()
      }
    }, {});
  }

  has(propName, valueHash?, ref?) {
    return this.internal.has(propName) && (
      typeof valueHash !== 'undefined' ?
        this.internal.get(propName).has(valueHash, ref) :
        true
    )
  }

  from(propName, valueHash?) {
    if (this.internal.has(propName)) {
      let firstLevel = this.internal.get(propName);
      if (typeof valueHash !== 'undefined') {
        if (firstLevel.has(valueHash)) {
          return firstLevel.from(valueHash)
        }
        throw new Error(
          `Could not read from DefaultIndex: path ` +
          `'${propName} -> ${valueHash}' does not exist`
        )
      }
      return firstLevel
    }
    throw new Error(
      `Could not read from DefaultIndex: key '${propName}' does not exist`
    )
  }

  add(k1, k2, k3) {
    let acc = this.internal;
    if(!acc.has(k1)) {
      acc = acc.add(k1, MultiMap.fromPairs([[]]));
    }
    let innerMap = acc.get(k1);
    if (innerMap.has(k2, k3)) {
      throw new Error(
        `Could not add to DefaultIndex: path '${[k1, k2, k3].join(', ')}' already exists`
      )
    }
    let newInnerMap = innerMap.add(k2, k3);
    let newOuterMap = acc.set(k1, newInnerMap);
    return new DefaultIndex(newOuterMap);
  }

  remove(k1, k2, k3) {
    let outerMap = this.internal;
    let errorMsg = `Could not remove from DefaultIndex: ` +
    `path '${[k1, k2, k3].join(', ')}' does not exist`
    if (!outerMap.has(k1)){
      throw new Error(errorMsg)
    }
    let innerMap = outerMap.get(k1);
    if (!innerMap.has(k2, k3)) {
      throw new Error(errorMsg)
    }
    let newInnerMap = innerMap.remove(k2, k3);
    outerMap = outerMap.set(k1, newInnerMap)
    if (newInnerMap.size() === 0) {
      outerMap = outerMap.remove(k1);
    }
    return outerMap;
  }
}
