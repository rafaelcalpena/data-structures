import { PointerMap } from '../pointer-map/pointer-map';
import { StringSet } from '../string-set/string-set';

interface IStateAndProps {
  state: PointerMap;
  props: {
    size: number,
  };
}
type addFactory = (a: IStateAndProps, e) => (k1, k2) => IStateAndProps;
const addFactory: addFactory = ({state: outerMap, props: {size}}, errorMsg) => (k1, k2) => {
  if (typeof k1 === 'undefined') {
    return {state: outerMap, props: {size}};
  }
  if (!outerMap.has(k1)) {
    outerMap = outerMap.add(k1, StringSet.fromEmpty());
  }
  const innerMap = outerMap.get(k1);

  let newInnerMap;
  if (innerMap.has(k2)) {
    throw new Error(errorMsg(k1, k2));
  }
  newInnerMap = innerMap.add(k2);

  outerMap = outerMap.set(k1, newInnerMap);

  return {
    props: {
      size: size + 1,
    },
    state: outerMap,
  };
};

/**
 * A MultiMap consists of a pointerMap with keys that point to
 * StringSets. This allows one-to-many relationships
 */
export class MultiMap {
  public static fromPairs(arrayPairs) {
    const outerMap = PointerMap.fromObject({});
    const stateAndProps = arrayPairs.reduce((outer, pair) =>
      addFactory(outer,
      (k1, k2) => `Could not create MultiMap: Pairs contain duplicate path '${k1}' -> '${k2}'`)
      (pair[0], pair[1]), {
        props: {
          size: 0,
        },
        state: outerMap,
      },
    );

    return new MultiMap({
      ...stateAndProps,
    });
  }

  /* TODO: add fromObject */

  constructor(private internal: IStateAndProps) {

  }

  public add(k1, k2) {
    return new MultiMap({
      ...addFactory(this.internal, (p1, p2) =>
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

  public getOne(k1) {
    return this.internal.state.get(k1).first();
  }

  public from(k1) {
    const {state: outerMap} = this.internal;
    if (!outerMap.has(k1)) {
      throw new Error(`Could not read from MultiMap: key '${k1}' does not exist`);
    }
    return outerMap.get(k1);
  }

  public remove(k1, k2?) {
    const {state: outerMap, props: {size}} = this.internal;

    if (typeof k2 === 'undefined') {
      return this.removeMany({[k1]: true});
    }

    return this.removeMany({[k1]: [k2]});

  }

  public removeMany(query: {[s: string]: string[] | boolean}): MultiMap {
    const outerMap = this.internal.state;
    const removeOuterKeys = [];
    const setOuterKeys = {};
    let size = this.size();
    const queryKeys = Object.keys(query);
    type keyValues = [string, string[] | boolean];

    const toPairs: (k: string) => keyValues = (k) => [k, query[k]];

    const orderedQuery: keyValues[] = queryKeys.map(toPairs);
    const removeInnerKeys = ([key, values]: keyValues) => {
      if (!outerMap.has(key)) {
        throw new Error(`Could not remove from MultiMap: key '${key}' does not exist`);
      }
      if (typeof values === "boolean") {
        size -= outerMap.get(key).size(),
        removeOuterKeys.push(key);
      } else {

        const innerMap = outerMap.get(key);
        values.forEach((k2) => {
          if (!innerMap.has(k2)) {
            throw new Error(`Could not remove from MultiMap: path '${key}' -> '${k2}' does not exist`);
          }
        });
        size -= values.length;
        const newInnerMap = innerMap.removeMany(values);
        if (newInnerMap.size() === 0) {
          removeOuterKeys.push(key);
        } else {
          setOuterKeys[key] = newInnerMap;
        }
      }

    };

    orderedQuery.forEach(removeInnerKeys);

    const newOuterMap = outerMap.removeMany(removeOuterKeys).setMany(setOuterKeys);
    return new MultiMap({
      props: {
        size,
      },
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

  public size() {
    return this.internal.props.size;
  }
}
