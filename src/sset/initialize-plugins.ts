import { SSetStatePropsPlugins } from './sset.d';

export const initializePlugins = (internalState: SSetStatePropsPlugins, pluginNames: string[]): SSetStatePropsPlugins => {
  /* The following combinations are possible:
  State + plugins
  State + properties
  State + plugins + properties
  For last possibility, the plugin can decide whether to trust
  provided properties or not. */
  const {plugins, state, props} = internalState;
  const updatedProps = pluginNames.reduce((acc, pluginName) => {
    const r = {
      ...acc,
      [pluginName]: plugins[pluginName].onInit(
          state,
          props[pluginName]
        )
      };

    return r;
  }, {...props});
  return {
    ...internalState,
    props: updatedProps
  };
};
