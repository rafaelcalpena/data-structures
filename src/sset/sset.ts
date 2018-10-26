import _ = require('lodash');
import { initializePlugins } from './initialize-plugins';
import {
  JSONCapable,
  SSetChanges,
  SSetDiff,
  SSetIterator,
  SSetPlugins,
  SSetStatePropsPlugins,
  SSetStatePropsPluginsJSON,
  SSetStaticProps,
} from './sset.d';
import { updatePlugins } from './update-plugins';

import * as objectHash from 'object-hash';

export const SSetStaticMethods: (a?: SSetPlugins) => SSetStaticProps = (curryPlugins) =>  {
  return {
    /** Given an array, create a SSet from it */
    fromArray(array: any[], props?: any): SSet {
      /* Remove any unsupported values for JSON */
      JSON.parse(JSON.stringify(array));

      const internalState = {
        plugins: curryPlugins,
        props: props ? props : {
            size: array.length,
        },
        state: array.reduce((acc, value) => {
          return {
            ...acc,
            [this.hashOf(value)]: value,
          };
        }, {}),
      };

      const pluginNames = Object.keys(curryPlugins);

      const newInternalState = initializePlugins(internalState, pluginNames);

      return new SSet(newInternalState);
    },
    /** Static method for obtaining default key for a given element and ensuring
     * their uniqueness. By default, uses object-hash sha1 algorithm.
     * If customized, needs to take into account possible collision scenarios and
     * deep-equality checking.
     */
    hashOf(value: any): any {
      /* Use respectType: false to avoid passing prototype, __proto__ and
      constructor properties. */
      return objectHash(value, {respectType: false, algorithm: 'sha1'});
    },

    /** Used for recreating a stringified SSet */
    fromJSON(JSONString: string): SSet {
      const jsonData = JSON.parse(JSONString);
      return SSet.addPlugins(curryPlugins).fromArray(jsonData.state, jsonData.props);
    },

    /** Add a new plugin to the SSet constructor. All sets created with this
     * constructor will contain the provided plugins.
     */
    addPlugins(plugins: SSetPlugins): SSetStaticProps {
      const result = SSetStaticMethods({
        ...curryPlugins,
        ...plugins,
      });
      return result;
    },

    removePlugins(plugins: string[]): SSetStaticProps {
      const result = _.omit({...curryPlugins}, plugins);
      return SSetStaticMethods(
        result,
      );
    },

    filterPlugins(plugins: string[]): SSetStaticProps {
      return SSetStaticMethods({
        ...curryPlugins,
      }).removePlugins(
        _.difference(
          Object.keys(curryPlugins),
          plugins,
        ),
      );
    },

    getActivePlugins: () => Object.keys(curryPlugins),

  };
};

type largestAndSmallestSets = (a: SSet, b: SSet) => [SSet, SSet];
const getLargestAndSmallestSets: largestAndSmallestSets = (set1, set2)  => (
  set1.size() < set2.size() ? [set1, set2] : [set2, set1]
);

const getOperationReducers = (set1: SSet, set2: SSet, largest: SSet, smallest: SSet) => {

  type argsType = (a: {set: SSet, hashes?: string[]}, b: any, c: boolean, d: any, e: boolean) => {set: SSet};
  const lsDifference: [{set: SSet, hashes: string[]}, argsType] =
  [ {set: largest, hashes: []},
    (acc: {set: SSet, hashes?: string[]}, item: any, largestHasIt: boolean, itemHash, isLast: boolean) => {

      /* Using Mutable for performance gains */
      if (largestHasIt) {
        acc.hashes.push(itemHash);
      }

      if (isLast === true) {
        return {
          set: acc.set.removeHashes(acc.hashes),
        };
      }
      return acc;
    },
  ];
  const slDifference: [{set: SSet, hashes: string[]}, argsType] =
  [ {set: smallest, hashes: []},
  (acc: {set: SSet, hashes?: string[]}, item: any, largestHasIt: boolean, itemHash, isLast: boolean) => {

    /* Using Mutable for performance gains */
    if (largestHasIt) {
      acc.hashes.push(itemHash);
    }

    if (isLast === true) {
      return {
        set: acc.set.removeHashes(acc.hashes),
      };
    }
    return acc;
  },
  ];

  const unionReducer: opReducerFn = (acc: opReducerFnAcc, item, largestHasIt, itemHash) => ({
    set: acc.set.mergeHash(itemHash, item),
  });

  const reducers: {
    union: [any, opReducerFn],
    difference: [any, opReducerFn],
    oppositeDifference: [any, opReducerFn],
    intersection: [any, opReducerFn],
  } = {
    /* Difference and oppositeDifference are being calculated respectively as
    largest - smallest and smallest - largest. */
    /* Since order for differences is important,
    swap them if set1 is not largest */
    difference: (set1 === largest) ? lsDifference : slDifference,
    intersection: [{set: smallest}, (acc, item, largestHasIt, itemHash) => ({
      set: largestHasIt ? acc.set : acc.set.removeHash(itemHash),
    })],
    oppositeDifference: set1 === largest ? slDifference : lsDifference,
    union: [{set: largest}, unionReducer],
  };

  return reducers;
};

type setsOps = 'union' | 'difference' | 'oppositeDifference' | 'intersection';
interface opReducerFnAcc {set: SSet; hashes?: string[]; }
type opReducerFn = (acc: opReducerFnAcc, item: any, largestHasIt: boolean, itemHash: any, isLast: boolean) => SSet | opReducerFnAcc;
type opReducer = [
  any,
  opReducerFn
];
type operationArrayItem = [string, SSet, (acc: SSet, item: any, largestHasIt: boolean) => SSet];

type reducerFn = (a: any, b: JSONCapable) => any ;

/** Class representing an Stringify-Capable Set. That is, a Set object
 * that can be serialized and passed between different environments, e.g.:
 * client-server (and vice-versa). Every modification returns a new Set
 * (for Immutability purposes)
 */
export class SSet {

  public static fromArray = SSetStaticMethods({}).fromArray;
  public static hashOf = SSetStaticMethods({}).hashOf;
  public static fromJSON = SSetStaticMethods({}).fromJSON;
  public static addPlugins = SSetStaticMethods({}).addPlugins;
  public static removePlugins = SSetStaticMethods({}).removePlugins;
  public static getActivePlugins = SSetStaticMethods({}).getActivePlugins;
  public static filterPlugins = SSetStaticMethods({}).filterPlugins;

  /** The constructor should preferably be used by internal operations.
   * For bootstrapping a new SSet from scratch, static methods such as
   * fromArray and fromJSON should be the norm.
   */
  constructor(private statePropsPlugins: SSetStatePropsPlugins) { }

  /* Mutation Methods below should be "reduced" into add and remove calls
   * Use internal hashes for quick lookup instead of has() method
   * (avoid extra costly conversion)
   */

  /**
   * Add a single value to the set. Value must not contain circular references,
   * functions, or any unsupported JSON object type
   */
   /* TODO: Add onAdd plugin listener, protect triggerChanges param from public API */
  public add(value: JSONCapable): SSet {

    const hash = SSet.hashOf(value);
    value = updatePlugins('onBeforeAdd', [value], [hash], this.statePropsPlugins).value;
    /* Check whether value is already contained in the set */
    const hashedValue = SSet.hashOf(value);
    if (hashedValue in this.statePropsPlugins.state) {
      throw new Error(`Value ${value} is already contained in the set`);
    }

    return this.merge(value);

  }

  /** Similar to add, but does not throw error if value already exists
   */
  /* TODO: Reduces to onAdd(value) for plugin listener(s) */
  public merge(value: JSONCapable, details: true): {value: SSet, info: any};
  public merge(value: JSONCapable): SSet;
  public merge(value: JSONCapable, details?: true): {value: SSet, info: any} | SSet {
    if (value instanceof SSet) {
      throw new Error('Please use union for merging two sets');
    }

    const hash = SSet.hashOf(value);

    return this.mergeHash(hash, value);

  }

  public mergeHash(hash, value) {
    const isNewItem = !(hash in this.statePropsPlugins.state);

    /* trigger onBeforeAdd if defined */
    value = updatePlugins('onBeforeAdd', [value], [hash], this.statePropsPlugins).value;

    let newInternalState: SSetStatePropsPlugins = {
      plugins: this.statePropsPlugins.plugins,
      props: {
        ...this.statePropsPlugins.props,
        size: (SSet.hashOf(value) in this.statePropsPlugins.state) ?
          this.statePropsPlugins.props.size :
          this.statePropsPlugins.props.size + 1,
      },
      state: {
        ...this.statePropsPlugins.state,
        [hash]: value,
      },
    };

    /* trigger onAdd if new item added */
    if (isNewItem) {
      newInternalState = updatePlugins('onAdd', [value], [hash], newInternalState);
    }

    return new SSet(newInternalState);
  }

  /** Merge the items of a given array into the SSet. Does not throw error if
   * value is already contained in the SSet.
   */
  /* TODO: Reduces to onAdd(values) for plugin listener(s) */
  public mergeArray(array: any[]): SSet {
    return array.reduce((acc, value) => {
      return acc.merge(value);
    }, this);
  }

  /** Remove a single item from the SSet.
   * If less than 50%, recreate props. Otherwise, remove from previous props
   */
  /* TODO: Add onRemove, plugin listener(s) */
  public remove(value: JSONCapable): SSet {

    const hashedValue = SSet.hashOf(value);
    if (!(hashedValue in this.statePropsPlugins.state)) {
      throw new Error(`There is no value ${value} in the set.`);
    }

    let newInternalState: SSetStatePropsPlugins = {
      plugins: this.statePropsPlugins.plugins,
      props: {
        ...this.statePropsPlugins.props,
        size: this.statePropsPlugins.props.size - 1,
      },
      state: _.omit(this.statePropsPlugins.state, [hashedValue]),
    };

    /* trigger onRemove */
    newInternalState = updatePlugins('onRemove', [value], [hashedValue], newInternalState);

    return new SSet(newInternalState);
  }

  /** Remove item given its hash */
  public removeHash(hashedValue: any): SSet {
    return this.removeHashes([hashedValue]);

  }

  public removeHashes(hashedValues: any[]): SSet {
    if (hashedValues.length === 0) {
      return this;
    }

    hashedValues.forEach((hashedValue) => {
      if (!(hashedValue in this.statePropsPlugins.state)) {
        throw new Error(`There is no hash ${hashedValue} in the set.`);
      }
    });

    let newInternalState: SSetStatePropsPlugins = {
      plugins: this.statePropsPlugins.plugins,
      props: {
        ...this.statePropsPlugins.props,
        size: this.statePropsPlugins.props.size - hashedValues.length,
      },
      state: _.omit(this.statePropsPlugins.state, hashedValues),
    };

    /* trigger onRemove */
    newInternalState = updatePlugins('onRemove', hashedValues.map((h) => this.statePropsPlugins.state[h]), hashedValues, newInternalState);

    return new SSet(newInternalState);
  }

  /** Obtain the union between two SSets.
   */
  /* TODO: Reduces to add(values) for plugins
  must provide props(a) and props(b).
  For props, the largest set should be the most efficient
  Provide largest props and recalculate from there
   */
  public union(set: SSet): SSet {
    return this.internalTwoSetsOperations(['union'], this, set).union;
  }

  /** Get items from current SSet that are absent in another SSet
   */
  /* TODO: Add onDifference? plugin listener(s)
  Should be the props of el that looks most alike
  For plugins: send before and after, rate of difference */
  public difference(set: SSet): SSet {
    /* TODO: Fix plugin issue for optimization */
    const result = this.internalTwoSetsOperations(['difference'], this, set).difference;
    const probEquals = result.probEquals(this);
    /* Performance improvement: only return new Set
    if difference is not itself */
    if (probEquals) {
      return this;
    }
    return result;
  }

  /** Get items that are exclusive to either current SSet or another
   * given SSet
   */
  /* TODO: Add onSymmetricDifference plugin listener(s) */
  public symmetricDifference(set: SSet): SSet {
    const {union, intersection} = this.internalTwoSetsOperations(
      ['union', 'intersection'], this, set,
    );
    /* Must use internalTwoSetsOperations, otherwise will
    trigger infinite loop between equals, difference and
    symmetricDifference */
    return this.internalTwoSetsOperations(
      ['difference'], union, intersection,
    ).difference;
  }

  /** Get items that are both contained in current and given set
   */
  public intersection(set: SSet): SSet {
    return this.internalTwoSetsOperations(
      ['intersection'], this, set,
    ).intersection;
  }

  /** Map all items from SSet to a new SSet
   */
  /* TODO: Merge plugins from previous SSet */
  public map(fn: (JSONCapable) => any): SSet {
    let newSet = SSet.fromArray([]);
    /* TODO: Replace with addMany for performance improvements, if desired */
    this.forEach((item) => newSet = newSet.add(fn(item)));
    return newSet;
  }

  /** Filter out undesired items from SSet. Creates new SSet with results
   */
  /* TODO: Add onFilter? plugin listener(s) */
  public filter(fn: (JSONCapable, hash) => boolean): SSet {
    let newSet: SSet = this;
    const remove = [];
    /* Using mutable for performance improvement */
    this.forEach((item, hash) => {
      if (!fn(item, hash)) {
        remove.push(hash);
      }
    });

    newSet = newSet.removeHashes(remove);
    return newSet;
  }

  /** Get size of the current SSet
   */
  public size(): number {
    /* TODO: Add case for when size plugin is disabled */
    return this.statePropsPlugins.props.size;
  }

  /** Retrieve a given Plugin's API
   */
  public $(name: string, args: any[] = []): any {
    const {state, props, plugins} = this.statePropsPlugins;
    return plugins[name].API(state, props[name], this, args);
  }

  /* Similar methods as above, but related to instance instead of static
  constructor */
  public addPlugins(plugins: SSetPlugins) {
    /* Append to plugins property and call onInit method */
    /* TODO: abstract/combine with static method. Also use SSet if possible */
    const {plugins: currentPlugins} = this.statePropsPlugins;
    const currentPluginsSet = SSet.fromArray(Object.keys(currentPlugins));

    const pluginKeys = Object.keys(plugins);
    const pluginsSet = SSet.fromArray(pluginKeys);
    /* Check whether a plugin is already added to SSet */
    if (!currentPluginsSet.isDisjoint(pluginsSet)) {
      const intersection = pluginsSet.intersection(currentPluginsSet);
      const ps = intersection.size() > 1 ? 's' : '';
      const isAre = intersection.size() > 1 ? 'are' : 'is';
      throw new Error (`Could not add plugin${ps} to SSet: Plugin${ps}` +
      ` '${intersection.toArray().join(', ')}' ${isAre} already active`);
    }

    /* Merge new plugins into existing */
    this.statePropsPlugins = {
      ...this.statePropsPlugins,
      plugins: {
        ...this.statePropsPlugins.plugins,
        ...plugins,
      },
    };

    /* Initialize only new plugins */
    const newInternalState = initializePlugins(this.statePropsPlugins, pluginKeys);

    return new SSet(newInternalState);
  }

  public removePlugins(plugins: string[]) {
    /* Call onDestroy method and remove from activePlugins list*/
    const newPlugins = plugins.reduce((oldPlugins, p) => {
      if (!(p in this.statePropsPlugins.plugins)) {
        throw new Error(`Could not remove plugin from SSet:` +
        ` Plugin '${p}' does not exist in this SSet`);
      }
      const plugin = this.statePropsPlugins.plugins[p];
      plugin.onDestroy();
      return _.omit(oldPlugins, [p]);
    }, {...this.statePropsPlugins.plugins});

    return new SSet(
      {
        ...this.statePropsPlugins,
        plugins: newPlugins,
      },
    );
  }

  /** Get current active plugins for given SSet instance */
  public getActivePlugins = (): string[] => Object.keys(this.statePropsPlugins.plugins);

  /**
   * Filter specific plugins from active plugins into new SSet
   */
  public filterPlugins(plugins: string[]) {
    /* Perform diff in activePlugins, then remove unnecessary plugins */
    return this.removePlugins(
      _.difference(this.getActivePlugins(), plugins),
    );
  }

  /** Checks whether current SSet is contained into another */
  public isSubset(set: SSet): boolean {
    return this.difference(set).isEmpty();
  }

  /** Check whether current SSet contains a given set */
  public isSuperset(set: SSet): boolean {
    return set.difference(this).isEmpty();
  }

  /** Check whether current SSet is empty */
  public isEmpty(): boolean {
    return this.size() === 0;
  }

  /** Alias for isSuperset */
  public hasSet(set: SSet): boolean {
    return this.isSuperset(set);
  }

  /** Alias for isSubset */
  public inSet(set: SSet): boolean {
    return this.isSubset(set);
  }

  /** Check whether a SSet contains an item */
  public has(value: JSONCapable): boolean {
    return SSet.hashOf(value) in this.statePropsPlugins.state;
  }

  public getOne() {
    return this.getSortedKeysArray()
    .map((key) => this.statePropsPlugins.state[key])[0];
  }

  /** Iterate over SSet using for ... of loops */
  public [Symbol.iterator](): SSetIterator {
    return {
      items: this.toArray(),
      next: function next() {
        return {
          done: this.items.length === 0,
          value: this.items.shift(),
        };
      },
    };
  }

  /** Loop through SSet items and perform a function on the item if desired */
  public forEach(fn: (JSONCapable, key?, isLast?: boolean) => void): void {
    const arr = this.getSortedKeysArray();
    arr.forEach((key, i) => {
      fn(this.statePropsPlugins.state[key], key, i + 1 === arr.length);
    });
  }

  /* TODO: add cancel loop property to forEach (performance improvement) */
  /** Check whether all items in SSet satisfy a given function */
  public every(fn: (JSONCapable) => boolean): boolean {
    let result = true;
    this.forEach((item) => {
      if (fn(item) !== true) {
        result = false;
      }
    });
    return result;
  }

  /** Check if at least one item in SSet satisfies a given function */
  public some(fn: (JSONCapable) => boolean): boolean {
    let result = false;
    this.forEach((item) => {
      if (fn(item) === true) {
        result = true;
      }
    });
    return result;
  }

  /** Find first item in the SSet that satisfies such function.
   * Returns undefined if no items are a match.
   */
  public find(fn: (JSONCapable) => boolean): any {
    let result;
    const found = false;
    this.forEach((item) => {
      if (!found && fn(item) === true) {
        result = item;
      }
    });
    return result;
  }

  /** Reduce current SSet into another object */
  public reduce(fn: reducerFn, acc): any {
    this.forEach((item) => {
      acc = fn(acc, item);
    });
    return acc;
  }

  /** Convert current SSet into an Array. Equal SSets will contain
   * same key ordering, although keys will be sorted by hashed content
   * (unreliable for number, string or object sorting)
   */
  public toArray(): any[] {
    /* Although immutability is usually better,
    we are using a mutable array for performance, since this is an isolated case */
    const arr = [];
    this.forEach((item) => arr.push(item));
    return arr;
  }

  /** Get necessary changes to turn current SSet into given SSet.
   */
  public changesTo(set: SSet): SSetDiff {
    return {
      changes: {
        difference: this.difference(set),
        union: set.difference(this),
      },
      from: this,
      to: set,
    };
  }

  /** Get necessary changes to turn given SSet into current SSet. */
  public changesFrom(set: SSet): SSetDiff {
    return set.changesTo(this);
  }

  /** Apply given changes to current SSet */
  public applyChanges(changes: SSetChanges): SSet {
    return this.union(changes.union).difference(changes.difference);
  }

  /** Revert given changes from current SSet */
  public revertChanges(changes: SSetChanges): SSet {
    return this.union(changes.difference).difference(changes.union);
  }

  /** Check whether current SSet is equal to given SSet */
  public equals(set: SSet): boolean {
    return (this === set) || this.symmetricDifference(set).isEmpty();
  }

  public probEquals(set) {
    return this === set;
  }

  /** This method is automatically used by JSON.stringify when converting to
   * JSON data
   */
  /* TODO: Add toJSON listener for plugins */
  public toJSON(): SSetStatePropsPluginsJSON {
    /* We only send the inner content of statePropsPlugins. Also, for state property,
    the keys are ignored and reconstructed later on the other environment */
    return {
      props: {...this.statePropsPlugins.props},
      state: this.toArray(),
    };
  }

  public isDisjoint(set: SSet): boolean {
    return this.intersection(set).isEmpty();
  }

  /** Gets the item for a given hash */
  public getByHash(hash) {
    const {state} = this.statePropsPlugins;
    if (hash in state) {
      return state[hash];
    }
    throw new Error(`No item in the set corresponds to hash '${hash}'`);
  }

  /**  */
  public hasHash(hash) {
    const {state} = this.statePropsPlugins;
    if (hash in state) {
      return true;
    }
    return false;
  }

  /** This method can perform Sum, difference, opposite difference
   * and intersection at the same time. Used for avoiding same item traversal
   * more than once
   */
  private internalTwoSetsOperations(
    operations: setsOps[],
    set1: SSet,
    set2: SSet,
  ): {
    [s in setsOps]?: SSet
  } {
    /* For efficiency, always loop over smallest set, and merge to largest */
    const [smallest, largest]: [SSet, SSet] = getLargestAndSmallestSets(set1, set2);

    const opReducers: {
      [s in setsOps]: opReducer
    } = getOperationReducers(set1, set2, largest, smallest);

    const operationsQueue = operations.map((name: setsOps) =>
      [name, ...opReducers[name]],
    );

    smallest.forEach((item, hash, isLast) => {
      const largestHasIt = largest.hasHash(hash);
      operationsQueue.forEach((opParams: any[] ) => {
        opParams[1] = opParams[2](opParams[1], item, largestHasIt, hash, isLast);
      });
    });

    return operationsQueue.reduce((acc, value: any) => {
      acc[value[0]] = value[1].set;
      return acc;
    }, {});

  }

  /** Although this is an unsorted SSet, it is convenient to use sorting for
   * for keys when iterating over similar SSets
   */
  private getSortedKeysArray(): string[] {
    return Object.keys(this.statePropsPlugins.state).sort();
  }

  /* TODO: static fromObjectKeys and fromObjectValues */

  /* TODO: add Transfer to and from sets */

  /* TODO: Implement fastEquals using bitwise-XOR SHA-256 hashing */

  /* TODO: Compute difference between remote sets */

}
