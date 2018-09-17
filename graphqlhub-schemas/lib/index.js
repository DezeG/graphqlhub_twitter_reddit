'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyValue = exports.GraphQLHub = exports.Github = exports.Twitter = exports.Reddit = exports.HackerNews = undefined;

var _hn = require('./hn');

var HackerNews = _interopRequireWildcard(_hn);

var _reddit = require('./reddit');

var Reddit = _interopRequireWildcard(_reddit);

var _twitter = require('./twitter');

var Twitter = _interopRequireWildcard(_twitter);

var _github = require('./github');

var Github = _interopRequireWildcard(_github);

var _graphqlhub = require('./graphqlhub');

var GraphQLHub = _interopRequireWildcard(_graphqlhub);

var _keyvalue = require('./keyvalue');

var KeyValue = _interopRequireWildcard(_keyvalue);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.HackerNews = HackerNews;
exports.Reddit = Reddit;
exports.Twitter = Twitter;
exports.Github = Github;
exports.GraphQLHub = GraphQLHub;
exports.KeyValue = KeyValue;