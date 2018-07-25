import { MultiMap } from '../multi-map/multi-map';
import { PointerMap } from '../pointer-map/pointer-map';
import {SSet} from '../sset/sset';

const addPairIfValid = (acc, [key, value]) => {
  const keyHash = SSet.hashOf(key);
  const valueHash = SSet.hashOf(value);

  /* Check if keyHash is already taken (collision) */
  if (acc.hashMap.has(keyHash)) {
    throw new Error(`2 pairs have the same keys: "${key}"`);
  }

  acc.hashMap = acc.hashMap.add(keyHash, valueHash);
  acc.inverseMap = acc.inverseMap.add(valueHash, keyHash);
  acc.items = acc.items.merge(key);
  acc.items = acc.items.merge(value);
  return acc;
};

const shouldCollectKey = (hash, inverseHashes) => {
  /* Since the key is unique, it can only still be present in the
  inverseHashes, as a value */
  return !(inverseHashes.has(hash));
};
const shouldCollectValue = (hash, keyHashes, inverseHashes) => {
  /* The value hash can be present either in the keyHashes or valueHashes */
  return !(
    keyHashes.has(hash) ||
    inverseHashes.has(hash)
  );
};

type keyValuePair = [any, any];
type pairsArrayType = keyValuePair[];

export class SMap {

  public static fromPairs(pairsArray: pairsArrayType) {
    /* create hashMap for storing key-value correspondence data */
    const hashMap = PointerMap.fromObject({});
    /* create inverseMap for inverse lookup */
    const inverseMap = MultiMap.fromPairs([[]]);
    /* create SSet to retrieve key and value actual data */
    const items = SSet.fromArray([]);
    /* only add pairs if there are no collisions */
    const result = pairsArray.reduce(addPairIfValid, {
      hashMap,
      inverseMap,
      items,
    });
    return new SMap(result);
  }

  constructor(private internalState = {
    hashMap: null,
    inverseMap: null,
    items: null,
  }) {}

  public get(key) {
    const {hashMap} = this.internalState;
    const keyHash = SSet.hashOf(key);
    if (!this.hasHash(keyHash)) {
      throw new Error('Item does not exist in SMap');
    }
    return hashMap[keyHash];
  }

  public has(key) {
    const keyHash = SSet.hashOf(key);
    return this.hasHash(keyHash);
  }

  public hasHash(hash) {
    const {hashMap} = this.internalState;
    return hash in hashMap;
  }

  public remove(key) {

    const {items, inverseMap, hashMap} = this.internalState;

    const keyHash = SSet.hashOf(key);

    if (!hashMap.has(keyHash)) {
      throw new Error(`Could not remove from SMap: key '${key}' does not exist`);
    }

    const valueHash = hashMap.get(keyHash);
    let newItems;
    let newHashMap;
    let newInverseMap;
    newItems = items;

    /* Removing the key and value hashes from hashMap is straightforward */
    newHashMap = hashMap.remove(keyHash);

    /* Next, remove key hash from value hash set */
    newInverseMap = inverseMap.remove(valueHash, keyHash);

    /* Last, check if removed key and value are being used elsewhere
    Both hashMap and inverseMap have to be checked */
    if (newItems.hasHash(keyHash)) {
      const keyItem = newItems.getByHash(keyHash);
      if (shouldCollectKey(keyHash, newInverseMap) && newItems.has(keyItem)) {
        newItems = newItems.remove(keyItem);
      }
    }

    if (newItems.hasHash(valueHash)) {
      const valueItem = newItems.getByHash(valueHash);
      if (shouldCollectValue(valueHash, newHashMap, newInverseMap) && newItems.has(valueItem)) {
        newItems = newItems.remove(valueItem);
      }
    }

    return new SMap({
      hashMap: newHashMap,
      inverseMap: newInverseMap,
      items: newItems,
    });

  }

  public add(key, value) {
    const {hashMap, items} = this.internalState;

    if (hashMap.has(SSet.hashOf(key))) {
      throw new Error(`Could not add to SMap: key '${key}' already exists`);
    }

    return this.set(key, value);
  }

  public toPairs() {
    const {hashMap, items} = this.internalState;
    return hashMap.toPairs().map(
      ([keyHash, valueHash]) => [
        items.getByHash(keyHash),
        items.getByHash(valueHash),
      ],
    );
  }

  public set(key, value) {
    const {hashMap, items, inverseMap} = this.internalState;
    let newHashMap;
    let newItems;
    let newInverseMap;

    const keyHash = SSet.hashOf(key);
    const valueHash = SSet.hashOf(value);
    const alreadyHasKey = hashMap.has(keyHash);
    /* If value has not changed, return current SMap */
    let previousValueHash;

    if (alreadyHasKey) {
      previousValueHash = hashMap.get(keyHash);
      if (valueHash === previousValueHash) {
        return this;
      }
    }

    newItems = items.merge(value).merge(key);
    newHashMap = hashMap.set(keyHash, valueHash);
    newInverseMap = inverseMap.add(valueHash, keyHash);
    /* if there was a previous value for such key, we must remove that too */
    newInverseMap = (previousValueHash) ?
      newInverseMap.remove(previousValueHash, keyHash) :
      newInverseMap;

    /* check whether old value can be removed from items */
    if (
      previousValueHash &&
      (!newHashMap.has(previousValueHash)) &&
      (!newInverseMap.has(previousValueHash))
    ) {
      /* TODO: implement removeByHash in SSet */
      newItems = newItems.remove(items.getByHash(previousValueHash));
    }

    return new SMap({
      hashMap: newHashMap,
      inverseMap: newInverseMap,
      items: newItems,
    });

  }

}
