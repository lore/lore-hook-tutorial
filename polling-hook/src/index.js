export default {

  dependencies: ['bindActions'],

  defaults: {
    polling: {
      interval: 3000
    }
  },

  load: (lore) => {
    // 1. Get the actions so we can make them pollable
    const actions = lore.actions;

    // 2. Get the application level config (defaults + config/polling.js)
    const appConfig = lore.config.polling;

    // 3. Get the model specific configs
    const modelConfigs = lore.loader.loadModels();

    // TODO: create a pollable version of each action
  }

}
