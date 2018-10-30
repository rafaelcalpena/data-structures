import _ = require('lodash');
import { PluginDeclarationProperties, SSetStatePropsPlugins } from './sset.d';

export const updatePlugins = (
  action: 'onBeforeAdd' | 'onAdd' | 'onRemove',
  items: any[],
  hashes: string[],
  internalState: SSetStatePropsPlugins,
): SSetStatePropsPlugins | any => {
  const {plugins, state, props} = internalState;

  if (action === 'onBeforeAdd') {
    const finalResult = {
      continue: true,
      message: null,
      value: items,
    };
    /* TODO: remove workaround */
    if (Object.keys(plugins).length === 0 && items.length === 1) {
      return {
        continue: true,
        message: null,
        value: items[0],
      };
    }
    return Object.keys(plugins).reduce((acc, pluginName) => {
      let listener: (
        items: any[],
        hashes: string[],
        props: PluginDeclarationProperties,
        state: any,
      ) => any = plugins[pluginName][action];

      if (!listener) {
        listener = () => {
          return {
            continue: true,
            message: null,
            value: items,
          };
        };
      }

      const result = listener(items, hashes, props[pluginName], state);
      if (result.continue !== true) {
        throw new Error(
          `Plugin ${pluginName} did not allow insertion: ${result.message}`,
        );
      }

      return result;

    }, finalResult);

  }

  return Object.keys(plugins).reduce((acc, pluginName) => {
    const listener: (
      items: any[],
      hashes: string[],
      props: PluginDeclarationProperties,
      state: any,
    ) => any = plugins[pluginName][action];

    const result = listener(items, hashes, props[pluginName], state);
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
