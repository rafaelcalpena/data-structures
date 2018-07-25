import { SSet } from "./sset";
import { SSetPlugins, SSetStaticProps } from "./sset.d";
import { initializePlugins } from "./initialize-plugins";
import _ = require("lodash");
import * as objectHash from 'object-hash';

export const SSetStaticMethods = (curryPlugins?: SSetPlugins) =>  ({
  /** Given an array, create a SSet from it */
  fromArray(array: any[], props?: any) : SSet {
    /* Remove any unsupported values for JSON */
    array = JSON.parse(JSON.stringify(array));

    let internalState = {
      state: array.reduce((acc, value) => {
        return {
          ...acc,
          [this.hashOf(value)]: value
        }
      }, {}),
      props: props ? props : {
          size: array.length
      },
      plugins: curryPlugins ? curryPlugins : {}
    };

    const pluginNames = Object.keys(curryPlugins || {});

    let newInternalState = initializePlugins(internalState, pluginNames);

    return new SSet(newInternalState);
  },
  /** Static method for obtaining default key for a given element and ensuring
  their uniqueness. By default, uses object-hash sha1 algorithm.
  If customized, needs to take into account possible collision scenarios and
  deep-equality checking. */
  hashOf(value: any): any {
    /* Use respectType: false to avoid passing prototype, __proto__ and
    constructor properties. */
    return objectHash(value, {respectType: false, algorithm: 'sha1'});
  },

  /** Used for recreating a stringified SSet */
  fromJSON(JSONString: string) : SSet {
    const jsonData = JSON.parse(JSONString);
    return SSet.addPlugins(curryPlugins).fromArray(jsonData.state, jsonData.props);
  },

  /** Add a new plugin to the SSet constructor. All sets created with this
  constructor will contain the provided plugins. */
  addPlugins(plugins: SSetPlugins) : SSetStaticProps {
    return SSetStaticMethods({
      ...curryPlugins,
      ...plugins
    });
  },

  removePlugins(plugins: string[]) : SSetStaticProps {
    return SSetStaticMethods(_.omit(curryPlugins, plugins));
  },

  onlyUsePlugins(plugins: SSetPlugins) : SSetStaticProps {
    return SSetStaticMethods({
      ...plugins
    });
  },

  getActivePlugins: () => curryPlugins

})