import { PointerMap } from '../pointer-map/pointer-map';

const addFactory = (outerMap, errorMsg) => function(k1, k2) {
  if (typeof k1 === 'undefined') {
    return outerMap;
  }
  if (!outerMap.has(k1)) {
    outerMap = outerMap.add(k1, PointerMap.fromObject({}));
  }
  const innerMap = outerMap.get(k1);

  let newInnerMap;
  if (innerMap.has(k2)) {
    throw new Error(errorMsg(k1, k2));
  }
  newInnerMap = innerMap.add(k2);

  outerMap = outerMap.set(k1, newInnerMap);
  return outerMap;
};

/** A MultiMap consists of a pointerMap with keys that point to
other pointerMaps. This allows one-to-many relationships */
export class MultiMap {
  public static fromPairs(arrayPairs) {
    const outerMap = PointerMap.fromObject({});
    const state = arrayPairs.reduce((outer, pair) =>
      addFactory(outer,
      (k1, k2) => `Could not create MultiMap: Pairs contain duplicate path '${k1}' -> '${k2}'`)
      (pair[0], pair[1]), outerMap,
    );
    return new MultiMap({
      state,
    });
  }

  /* TODO: add fromObject */

  constructor(private internal) {

  }

  public add(k1, k2) {
    return new MultiMap({
      state: addFactory(this.internal.state, (p1, p2) =>
      `Could not add to MultiMap: Path '${p1}' -> '${p2}' already exists`)(
        k1, k2,
      ),
    });
  }

  public has(k1, k2?) {
    return this.internal.state.has(k1) && (
      typeof k2 !== 'undefined' ? this.internal.state.get(k1).has(k2) : true
    );
  }

  public from(k1) {
    const {state: outerMap} = this.internal;
    if (!outerMap.has(k1)) {
      throw new Error(`Could not read from MultiMap: key '${k1}' does not exist`);
    }
    return outerMap.get(k1);
  }

  public remove(k1, k2?) {
    const {state: outerMap} = this.internal;
    if (!outerMap.has(k1)) {
      throw new Error(`Could not remove from MultiMap: key '${k1}' does not exist`);
    }
    if (typeof k2 === 'undefined') {
      return new MultiMap({
        state: outerMap.remove(k1),
      });
    }
    const innerMap = outerMap.get(k1);
    if (!innerMap.has(k2)) {
      throw new Error(`Could not remove from MultiMap: path '${k1}' -> '${k2}' does not exist`);
    }
    const newInnerMap = outerMap.get(k1).remove(k2);
    let newOuterMap;
    if (newInnerMap.size() === 0) {
      newOuterMap = outerMap.remove(k1);
    } else {
      newOuterMap = outerMap.set(k1, newInnerMap);
    }
    return new MultiMap({
      state: newOuterMap,
    });

  }

  public toObject() {
    const outerMap = this.internal.state.toObject();
    return Object.keys(outerMap).reduce((result, key) => {
      return {
        ...result,
        [key]: outerMap[key].toObject(),
      };
    }, {});
  }
}
