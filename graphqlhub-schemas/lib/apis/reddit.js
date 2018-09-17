'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComments = exports.getSubredditListings = exports.getSubreddit = exports.getUser = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var get = function get(path, query) {
  if (query) {
    query = '?' + _qs2.default.stringify(query);
  } else {
    query = '';
  }
  return (0, _nodeFetch2.default)('https://reddit.com/' + path + '.json' + query).then(function (res) {
    return res.json();
  });
};

var getUser = exports.getUser = function getUser(username) {
  return get('user/' + username + '/about');
};

var getSubreddit = exports.getSubreddit = function getSubreddit(name) {
  return get('r/' + name + '/about');
};

var getSubredditListings = exports.getSubredditListings = function getSubredditListings(subredditName, listingType) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return get('r/' + subredditName + '/' + listingType, options);
};

var getComments = exports.getComments = function getComments(subredditName, linkId) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return get('r/' + subredditName + '/comments/' + linkId, options);
};