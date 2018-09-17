'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _twitter = require('./apis/twitter');

var twitter = _interopRequireWildcard(_twitter);

var _graphql = require('graphql');

var _error = require('graphql/error');

var _language = require('graphql/language');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserType = new _graphql.GraphQLObjectType({
  name: 'TwitterUser',
  description: 'Twitter user',
  fields: function fields() {
    return {
      created_at: { type: _graphql.GraphQLString },
      description: { type: _graphql.GraphQLString },
      id: { type: _graphql.GraphQLID }, // GraphQLInt would return null
      screen_name: { type: _graphql.GraphQLString },
      name: { type: _graphql.GraphQLString },
      profile_image_url: { type: _graphql.GraphQLString },
      url: { type: _graphql.GraphQLString },
      tweets_count: {
        type: _graphql.GraphQLInt,
        resolve: function resolve(_ref) {
          var statuses_count = _ref.statuses_count;
          return statuses_count;
        }
      },
      followers_count: { type: _graphql.GraphQLInt },
      tweets: {
        type: new _graphql.GraphQLList(TweetType),
        description: 'Get a list of tweets for current user',
        args: {
          limit: {
            type: _graphql.GraphQLInt,
            defaultValue: 10
          }
        },
        //             user            args
        resolve: function resolve(_ref2, _ref3) {
          var user_id = _ref2.id;
          var limit = _ref3.limit;
          return twitter.getTweets(user_id, limit);
        }
      }
    };
  }

});

var TweetType = new _graphql.GraphQLObjectType({
  name: 'Tweet',
  description: 'A tweet object',
  fields: function fields() {
    return {
      id: { type: _graphql.GraphQLID },
      created_at: { type: _graphql.GraphQLString },
      text: { type: _graphql.GraphQLString },
      full_text: { type: _graphql.GraphQLString },
      retweet_count: { type: _graphql.GraphQLInt },
      user: { type: UserType },
      retweets: {
        type: new _graphql.GraphQLList(RetweetType),
        description: 'Get a list of retweets',
        args: {
          limit: {
            type: _graphql.GraphQLInt,
            defaultValue: 5
          }
        },
        //        passing integer 'id' here doesn't work surprisingly, had to use 'id_str'
        resolve: function resolve(_ref4, _ref5) {
          var tweetId = _ref4.id_str;
          var limit = _ref5.limit;
          return twitter.getRetweets(tweetId, limit);
        }
      }
    };
  }
});

var RetweetType = new _graphql.GraphQLObjectType({
  name: 'Retweet',
  description: 'Retweet of a tweet',
  fields: function fields() {
    return {
      id: { type: _graphql.GraphQLID },
      created_at: { type: _graphql.GraphQLString },
      in_reply_to_tweet_id: {
        type: _graphql.GraphQLString,
        resolve: function resolve(_ref6) {
          var in_reply_to_status_id = _ref6.in_reply_to_status_id;
          return in_reply_to_status_id;
        }
      },
      in_reply_to_user_id: { type: _graphql.GraphQLInt },
      in_reply_to_screen_name: { type: _graphql.GraphQLString },
      retweeted_status: { type: TweetType },
      user: { type: UserType }
    };
  }
});

var userIdentityType = new _graphql.GraphQLScalarType({
  name: 'UserIdentity',
  description: 'Parse user provided identity',
  serialize: function serialize(value) {
    return value;
  },
  parseValue: function parseValue(value) {
    return value;
  },
  parseLiteral: function parseLiteral(ast) {

    if (ast.kind !== _language.Kind.STRING && ast.kind !== _language.Kind.INT) {
      throw new _error.GraphQLError("Query error: Can only parse Integer and String but got a: " + ast.kind, [ast]);
    }

    return ast.value;
  }
});

var userIdentifierType = new _graphql.GraphQLEnumType({
  name: 'UserIdentifier',
  description: 'Either user unique ID, or screen name',
  values: {
    'id': { value: 'user_id' },
    'name': { value: 'screen_name' }
  }
});

var searchReponseType = new _graphql.GraphQLEnumType({
  name: 'SearchReponse',
  description: 'Type of search response.',
  values: {
    mixed: { value: 'mixed' },
    recent: { value: 'recent' },
    popular: { value: 'popular' }
  }
});

var twitterType = new _graphql.GraphQLObjectType({
  name: 'TwitterAPI',
  description: 'The Twitter API',
  fields: {
    user: {
      type: UserType,
      args: {
        identifier: {
          description: 'Either user_id or screen_name',
          type: new _graphql.GraphQLNonNull(userIdentifierType)
        },
        identity: {
          description: 'User ID (Integer) or Screen name (String) to identify user',
          type: new _graphql.GraphQLNonNull(userIdentityType)
        }
      },
      resolve: function resolve(_, _ref7) {
        var identifier = _ref7.identifier,
            identity = _ref7.identity;
        return twitter.getUser(identifier, identity);
      }
    },
    tweet: {
      type: TweetType,
      args: {
        id: {
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
          description: 'Unique ID of tweet'
        }
      },
      resolve: function resolve(_, _ref8) {
        var tweetId = _ref8.id;
        return twitter.getTweet(tweetId);
      }
    },
    search: {
      type: new _graphql.GraphQLList(TweetType),
      description: "Returns a collection of relevant Tweets matching a specified query.",
      args: {
        q: {
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
          description: "A UTF-8, URL-encoded search query of 500 characters maximum, including operators. Queries may additionally be limited by complexity."
        },
        count: {
          type: _graphql.GraphQLInt,
          description: "The number of tweets to return per page, up to a maximum of 100. This was formerly the “rpp” parameter in the old Search API."
        },
        result_type: {
          type: searchReponseType,
          description: 'Specifies what type of search results you would prefer to receive. Valid values include:\n          * mixed: Include both popular and real time results in the response.\n          * recent: return only the most recent results in the response\n          * popular: return only the most popular results in the response.'
        },
        tweet_mode: {
            type: _graphql.GraphQLString,
        }
      },
      resolve: function resolve(_, searchArgs) {
        return twitter.searchFor(searchArgs);
      }
    }
  }
});

var QueryObjectType = exports.QueryObjectType = twitterType;
