'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchFor = exports.getRetweets = exports.getTweet = exports.getTweets = exports.getUser = undefined;

var _twit = require('twit');

var _twit2 = _interopRequireDefault(_twit);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _process$env = process.env,
    TWITTER_CONSUMER_KEY = _process$env.TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET = _process$env.TWITTER_CONSUMER_SECRET;

// Twit throws a runtime error if you try to create a client
// without API keys, so we do it lazily

var twitterClient = undefined;
var getTwitterClient = function getTwitterClient() {
  if (!twitterClient) {
    twitterClient = new _twit2.default({
      consumer_key: TWITTER_CONSUMER_KEY,
      consumer_secret: TWITTER_CONSUMER_SECRET,
      app_only_auth: true
    });
  }
  return twitterClient;
};

var getUser = exports.getUser = function getUser(identifier, identity) {
  return __getPromise('users/show', _defineProperty({}, identifier, identity));
};
var getTweets = exports.getTweets = function getTweets(user_id, count) {
    return __getPromise('statuses/user_timeline', { user_id: user_id, count: count, tweet_mode: 'extended' });
};
var getTweet = exports.getTweet = function getTweet(id) {
  return __getPromise('statuses/show', { id: id, tweet_mode: 'extended' });
};
var getRetweets = exports.getRetweets = function getRetweets(id, count) {
  return __getPromise('statuses/retweets', { id: id, count: count });
};
var searchFor = exports.searchFor = function searchFor(queryParams) {
  return __getPromise("search/tweets", queryParams, 'statuses');
};

var __getPromise = function __getPromise(endpoint, parameters) {
  var resultPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


  return new Promise(function (resolve, reject) {

    getTwitterClient().get(endpoint, parameters, function (error, result) {

      if (error) {
        reject(error);
      } else {
        resolve(resultPath !== null ? _lodash2.default.get(result, resultPath) : result);
      }
    });
  });
};
