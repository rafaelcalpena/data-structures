/* TODO: Maybe add array support? */
import * as _ from 'lodash';
import {MultiMap} from '../multi-map/multi-map';
import {PointerMap} from '../pointer-map/pointer-map';
import {SSet} from '../sset/sset';

export const createTriples = (triples, {hash: itemHash, item}) => {
  /* for each property, add value to index */
  /* TODO: add config to include/exclude properties
  and nested objects */
  /* TODO check whether id is duplicated */
  const keys = Object.keys(item);
  keys.forEach((k) => {
    const valueHash = SSet.hashOf(item[k]);
    triples = [...triples, [k, valueHash, itemHash] ];
  });
  return triples;
};
