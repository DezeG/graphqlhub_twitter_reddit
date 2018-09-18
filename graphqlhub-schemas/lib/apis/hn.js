'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJobStoryIds = exports.getShowStoryIds = exports.getAskStoryIds = exports.getNewStoryIds = exports.getTopStoryIds = exports.getUser = exports.getItem = undefined;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var get = function get(path) {
  return (0, _nodeFetch2.default)('https://hacker-news.firebaseio.com/v0/' + path + '.json').then(function (res) {
    return res.json();
  });
};

var getItem = exports.getItem = function getItem(id) {
  return get('item/' + id);
};

var getUser = exports.getUser = function getUser(id) {
  return get('user/' + id);
};

var getTopStoryIds = exports.getTopStoryIds = function getTopStoryIds() {
  return get('topstories');
};

var getNewStoryIds = exports.getNewStoryIds = function getNewStoryIds() {
  return get('newstories');
};

var getAskStoryIds = exports.getAskStoryIds = function getAskStoryIds() {
  return get('askstories');
};

var getShowStoryIds = exports.getShowStoryIds = function getShowStoryIds() {
  return get('showstories');
};

var getJobStoryIds = exports.getJobStoryIds = function getJobStoryIds() {
  return get('jobstories');
};