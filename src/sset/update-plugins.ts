import { SSetStatePropsPlugins, PluginDeclarationProperties } from './sset.d';
import _ = require('lodash');

export function updatePlugins (
  action: 'onAdd' | 'onRemove',
  item: any,
  hash: string,
  internalState: SSetStatePropsPlugins
): SSetStatePropsPlugins {
  const {plugins, state, props} = internalState;
  return _.reduce(Object.keys(plugins), (acc, pluginName) => {
    const listener: (
      item: any,
      hash: string,
      props: PluginDeclarationProperties,
      state: any
    ) => any = plugins[pluginName][action];
    if (listener) {
      return {
        state,
        props: {
          ...acc.props,
          [pluginName]: listener(item, hash, props[pluginName], state)
        },
        plugins
      };
    }
    return acc;
  }, internalState);
}
