/* TODO: Maybe add array support? */
import _ = require('lodash');
import {MultiMap} from '../multi-map/multi-map';
import {PointerMap} from '../pointer-map/pointer-map';
import {SSet} from '../sset/sset';

export const createTriples = (triples, {hash: itemHash, item}) => {
  if (_.isPlainObject(item)) {
    /* for each property, add value to index */
    /* TODO: add config to include/exclude properties
    and nested objects */
    /* TODO check whether id is duplicated */
    const keys = Object.keys(item);
    keys.forEach((k) => {
      triples = [...triples, [k, SSet.hashOf(item[k]), itemHash] ];
    });
  }
  return triples;
};
