var _ = require('lodash');

function poll(action, config, query={}) {
  // invoke the action
  action(query);

  // wait the specified interval, then invoke the action again
  setTimeout(function() {
    poll(action, config, query);
  }, config.interval);
}

module.exports = {

  dependencies: ['bindActions'],

  defaults: {
    polling: {
      interval: 3000
    }
  },

  load: function(lore) {
    // get the actions so we can make them pollable
    var actions = lore.actions;

    // get the application level config (defaults + config/polling.js)
    var appConfig = lore.config.polling;

    // get the model specific config (for tweet)
    var modelConfig = lore.loader.loadModels().tweet;

    // combine values from both configs, giving priority to values in the model config
    var config = _.defaults({}, modelConfig.polling, appConfig);

    // expose our target tweet.find action in a poll-able container
    lore.polling = {
      tweet: {
        find: poll.bind(null, actions.tweet.find, config)
      }
    };
  }

};
