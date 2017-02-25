import _ from 'lodash';

/**
 * Flatten javascript objects into a single-depth object
 * https://gist.github.com/penguinboy/762197
 */
function flattenObject(ob) {
  const toReturn = {};

  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object') {
      const flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

/**
 * Call the action (with the bound arguments) every [interval] milliseconds
 */
function poll(action, config) {
  // invoke the action
  action();

  // wait the specified interval, then invoke the action again
  setTimeout(function() {
    poll(action, config);
  }, config.interval);
}

function createPollingWrapper(action, config) {
  return function callAction() {
    // Create a version of the action that is bound to the arguments provided by the
    // user. This makes sure the hook will work with any arbitrary function - it simply
    // invokes that action with the provided arguments on the requested interval
    const boundAction = Function.prototype.apply.bind(action).bind(null, null, arguments);

    // Begin polling the action
    return poll(boundAction, config);
  }
}

export default {

  dependencies: ['bindActions'],

  defaults: {
    polling: {
      interval: 3000
    }
  },

  load: function(lore) {
    // 1. Get the actions so we can make them pollable
    const actions = lore.actions;

    // 2. Get the application level config (defaults + config/polling.js)
    const appConfig = lore.config.polling;

    // 3. Get the model specific configs
    const modelConfigs = lore.loader.loadModels();

    // 4. Create a polling object that will mirror the structure of the actions object
    lore.polling = {};

    // 5. Iterate over each action and create a pollable version attached to the polling object
    _.mapKeys(flattenObject(actions), function (action, actionKey) {
      // 6. Get the model specific config
      const modelName = actionKey.split('.')[0];
      const modelConfig = modelConfigs[modelName];

      // 7. Combine values from both configs, giving priority to values in the model config
      const config = _.defaults({}, modelConfig.polling, appConfig);

      // 8. Generate the pollable version of the action
      _.set(lore.polling, actionKey, createPollingWrapper(action, config));
    });
  }

}
