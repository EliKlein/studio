var _ = require('underscore');
var utils = require('./importUtils');
var createContentNodeCollection = utils.createContentNodeCollection;
var fetchImportableChannels = utils.fetchImportableChannels;

// Sends a request to `get_total_size` endpoint and updates store with result
exports.calculateImportSize = function(context) {
  // HACK use negative number to signal still pending
  context.commit('UPDATE_IMPORT_SIZE', -1);
  if (context.state.itemsToImport.length === 0) {
    return context.commit('UPDATE_IMPORT_SIZE', 0);
  }
  return createContentNodeCollection(context.state.itemsToImport)
  .calculate_size()
  .then(function(size) {
    context.commit('UPDATE_IMPORT_SIZE', size);
  });
}

// Adds a ContentNode to to-import list
exports.addItemToImportList = function(context, contentNode) {
  if (!_.contains(context.getters.itemsToImportIds), contentNode.id) {
    context.commit('ADD_ITEM_TO_IMPORT_LIST', contentNode)
    return context.dispatch('calculateImportSize');
  }
}

// Given a ContentNode ID, removes from to-import list
exports.removeItemFromImportList = function(context, id) {
  if (_.contains(context.getters.itemsToImportIds), id) {
    context.commit('REMOVE_ITEM_FROM_IMPORT_LIST', id);
    return context.dispatch('calculateImportSize');
  }
}

// Requests the root nodes for the importable channels
exports.loadChannels = function(context) {
  context.commit('UPDATE_CHANNELS_ARE_LOADING', true);
  return fetchImportableChannels()
  .then(function onSuccess(channels) {
    context.commit('UPDATE_CHANNELS', channels);
    context.commit('UPDATE_CHANNELS_ARE_LOADING', false);
  });
}

// Takes the to-import list and copies/duplicates them over to the current channel
exports.copyImportListToChannel = function(context, payload) {
  context.commit('UPDATE_IMPORT_STATUS', 'start');
  var importCollection = createContentNodeCollection(context.state.itemsToImport);
  return importCollection
  .duplicate(payload.baseViewModel)
  .then(function onSuccess(collection) {
    context.commit('UPDATE_IMPORT_STATUS', 'success');
    payload.onConfirmImport(collection);
  });
}

exports.goToPreviousPage = function(context) {
  if (context.getters.currentImportPage === 'search_results') {
    context.commit('UPDATE_PAGE_STATE', { pageType: 'tree_view' });
  }
  context.commit('RESET_IMPORT_STATE');
}

exports.goToSearchResults = function(context, payload) {
  context.commit('RESET_IMPORT_STATE');
  context.commit('UPDATE_PAGE_STATE', {
    pageType: 'search_results',
    data: {
      searchTerm: payload.searchTerm,
    },
  })
}

exports.goToImportPreview = function(context) {
  context.commit('UPDATE_PAGE_STATE', {
    pageType: 'import_preview',
  });
}
