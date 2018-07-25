import _ = require('lodash');
import { PluginDeclarationProperties, SSetStatePropsPlugins } from './sset.d';

export function updatePlugins(
  action: 'onAdd' | 'onRemove',
  item: any,
  hash: string,
  internalState: SSetStatePropsPlugins,
): SSetStatePropsPlugins {
  const {plugins, state, props} = internalState;
  return _.reduce(Object.keys(plugins), (acc, pluginName) => {
    const listener: (
      item: any,
      hash: string,
      props: PluginDeclarationProperties,
      state: any,
    ) => any = plugins[pluginName][action];
    if (listener) {
      return {
        plugins,
        props: {
          ...acc.props,
          [pluginName]: listener(item, hash, props[pluginName], state),
        },
        state,
      };
    }
    return acc;
  }, internalState);
}
