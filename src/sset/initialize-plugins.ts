import { SSetStatePropsPlugins } from './sset.d';

type initializePluginsType = ( a: SSetStatePropsPlugins, b: string[]) => SSetStatePropsPlugins;
export const initializePlugins: initializePluginsType = (internalState, pluginNames) => {
  /* The following combinations are possible:
  State + plugins
  State + properties
  State + plugins + properties
  For last possibility, the plugin can decide whether to trust
  provided properties or not. */
  const {plugins, state, props} = internalState;
  const updatedPropsAndState = pluginNames.reduce((acc, pluginName) => {
    const {props: newProps, state: newState} = plugins[pluginName].onInit(
        state,
        props[pluginName],
      );
    const r = {
      props: {
        ...acc.props,
        [pluginName]: newProps
      },
      state: newState
    };

    return r;
  }, {props: {...props}, state: {...state}});
  return {
    ...internalState,
    ...updatedPropsAndState,
  };
};
