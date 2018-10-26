import { SSet } from "./sset";

/** Must only contain stringify-capable structures and plugin functions */
export interface SSetStatePropsPlugins {
  state: Object,
  /** Derived properties from state, optional. Must be validated in the server,
  to avoid state-props inconsistencies and exploits */
  props: {
    size?: number;
  },
  plugins: SSetPlugins
}

export interface SSetStatePropsPluginsJSON {
  state: Object,
  /** Derived properties from state, optional. Must be validated in the server,
  to avoid state-props inconsistencies and exploits */
  props: {
    size?: number;
  },
  plugins?: string[]
}

/** Describes a mutation log */
export interface SSetDiff {
  from: SSet,
  to: SSet,
  changes: SSetChanges
}

/** Contains the necessary information for mutating one set into another */
export interface SSetChanges {
    union: SSet,
    difference: SSet
}

export type JSONCapable = object | number | string | Array<any>;

export type SSetIterator = {
  items: Array<any>,
  next: () => {
    done: boolean,
    value: any
  }
}

export type PluginDeclarationProperties = {
  onInit: (state, props) => {
    state: any,
    props: any
  }
  onAdd?: (item, hash, props, state) => any,
  onRemove?: (items, hash, props, state) => any,
  onDestroy?: () => void,
  API: (state, props, set: SSet, args: any[]) => any
}

export type SSetPlugins = {
  [s: string]: PluginDeclarationProperties
};

export type SSetStaticProps = {
  fromArray,
  hashOf,
  fromJSON,
  addPlugins,
  removePlugins,
  filterPlugins,
  getActivePlugins
}

export type SSetStaticMethods = () => SSetStaticProps
