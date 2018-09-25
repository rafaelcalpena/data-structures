import _ = require('lodash');
import { PluginDeclarationProperties, SSetStatePropsPlugins } from './sset.d';

export const updatePlugins = (
  action: 'onBeforeAdd' | 'onAdd' | 'onRemove',
  item: any,
  hash: string,
  internalState: SSetStatePropsPlugins,
): SSetStatePropsPlugins | any => {
  const {plugins, state, props} = internalState;

  if (action === 'onBeforeAdd') {
    const finalResult = {
      continue: true,
      message: null,
      value: item,
    };
    return _.reduce(Object.keys(plugins), (acc, pluginName) => {
      let listener: (
        item: any,
        hash: string,
        props: PluginDeclarationProperties,
        state: any,
      ) => any = plugins[pluginName][action];

      if (!listener) {
        listener = () => {
          return {
            continue: true,
            message: null,
            value: item,
          };
        };
      }

      const result = listener(item, hash, props[pluginName], state);

      if (result.continue !== true) {
        throw new Error(
          `Plugin ${pluginName} did not allow insertion: ${result.message}`,
        );
      }

      return result;

    }, finalResult);

  }

  return _.reduce(Object.keys(plugins), (acc, pluginName) => {
    const listener: (
      item: any,
      hash: string,
      props: PluginDeclarationProperties,
      state: any,
    ) => any = plugins[pluginName][action];

    const result = listener(item, hash, props[pluginName], state);

    return {
      plugins,
      props: {
        ...acc.props,
        [pluginName]: result,
      },
      state,
    };
  }, internalState);
};
