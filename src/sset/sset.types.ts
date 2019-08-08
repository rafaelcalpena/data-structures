import { SSet } from "./sset";

/** Must only contain stringify-capable structures and plugin functions */
export interface ISSetStatePropsPlugins {
  state: object;
  /**
   *  Derived properties from state, optional. Must be validated in the server,
   *  to avoid state-props inconsistencies and exploits
   */
  props: {
    size?: number;
  };
  plugins: ISSetPlugins;
}

export interface ISSetStatePropsPluginsJSON {
  state: object;
  /** Derived properties from state, optional. Must be validated in the server,
   * to avoid state-props inconsistencies and exploits
   */
  props: {
    size?: number;
  };
  plugins?: string[];
}

/** Describes a mutation log */
export interface ISSetDiff {
  from: SSet;
  to: SSet;
  changes: ISSetChanges;
}

/** Contains the necessary information for mutating one set into another */
export interface ISSetChanges {
    union: SSet;
    difference: SSet;
}

export type JSONCapable = object | number | string | any[];

export interface ISSetIterator {
  items: any[];
  next: () => {
    done: boolean,
    value: any,
  };
}

export interface IPluginDeclarationProperties {
  onInit: (state, props) => {
    state: any,
    props: any,
  };
  onAdd?: (item, hash, props, state) => any;
  onRemove?: (items, hash, props, state) => any;
  onDestroy?: () => void;
  API: (state, props, set: SSet, args: any[]) => any;
}

export interface ISSetPlugins {
  [s: string]: IPluginDeclarationProperties;
}

export interface ISSetStaticProps {
  fromArray;
  hashOf;
  fromJSON;
  addPlugins;
  removePlugins;
  filterPlugins;
  getActivePlugins;
}

export type SSetStaticMethods = () => ISSetStaticProps;
