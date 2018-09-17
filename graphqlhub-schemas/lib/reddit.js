'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _reddit = require('./apis/reddit');

var _graphql = require('graphql');

/*
  Listing
  Article
  Comment
  User
*/

var itemTypeEnum = new _graphql.GraphQLEnumType({
  name: 'ItemType',
  description: 'The type of object',
  values: {
    comment: {
      value: 't1'
    },
    account: {
      value: 't2'
    },
    link: {
      value: 't3'
    },
    message: {
      value: 't4'
    },
    subreddit: {
      value: 't5'
    },
    award: {
      value: 't6'
    },
    promoCampaign: {
      value: 't8'
    }
  }
});

var timeIntervalType = new _graphql.GraphQLEnumType({
  name: 'TimeInterval',
  description: 'Time interval by which listings are queried',
  values: {
    hour: {
      value: 'hour'
    },
    day: {
      value: 'day'
    },
    week: {
      value: 'week'
    },
    month: {
      value: 'month'
    },
    year: {
      value: 'year'
    },
    all: {
      value: 'All'
    }
  }
});

var userType = new _graphql.GraphQLObjectType({
  name: 'RedditUser',
  description: 'Information about a Reddit user',
  fields: {
    fullnameId: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The Reddit API fullname of the user',
      resolve: function resolve(user) {
        return user.kind + '_' + user.data.id;
      }
    },
    username: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The user\'s unique username.',
      resolve: function resolve(user) {
        return user.data.name;
      }
    },
    created: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'Creation date of the user, in Unix Time (UTC)',
      resolve: function resolve(user) {
        return user.data.created_utc;
      }
    },
    createdISO: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Creation date of the user, in ISO8601',
      resolve: function resolve(user) {
        var date = new Date(user.data.created_utc * 1000);
        return date.toISOString();
      }
    },
    linkKarma: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Karma by links of the user',
      resolve: function resolve(user) {
        return user.data.link_karma;
      }
    },
    commentKarma: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Karma by comments of the user',
      resolve: function resolve(user) {
        return user.data.comment_karma;
      }
    }
  }
});

var createListingField = function createListingField(description, listingType) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$hasTimeInterval = _ref.hasTimeInterval,
      hasTimeInterval = _ref$hasTimeInterval === undefined ? false : _ref$hasTimeInterval;

  var args = {
    after: {
      description: 'FullnameId of an item in the listing to use as the anchor point of the slice.',
      type: _graphql.GraphQLString
    },
    before: {
      description: 'FullnameId of an item in the listing to use as the anchor point of the slice.',
      type: _graphql.GraphQLString
    },
    count: {
      description: 'The number of items already seen in this listing',
      type: _graphql.GraphQLInt
    },
    limit: {
      description: 'The maximum number of items to return in this slice of the listing.',
      type: _graphql.GraphQLInt
    }
  };
  if (hasTimeInterval) {
    args.timeInterval = {
      description: 'Time interval to retrieve listings',
      type: timeIntervalType
    };
  }
  return {
    description: description,
    args: args,
    type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(linkType)),
    resolve: function resolve(subreddit, args) {
      var requestOptions = args;
      requestOptions.t = args.timeInterval;
      delete requestOptions.timeInterval;
      return (0, _reddit.getSubredditListings)(subreddit.data.display_name, listingType, requestOptions).then(function (data) {
        return data.data.children;
      });
    }
  };
};

var commentType = new _graphql.GraphQLObjectType({
  name: 'RedditComment',
  description: 'A comment on a link',
  fields: function fields() {
    return {
      author: {
        description: 'Author of the comment',
        type: new _graphql.GraphQLNonNull(userType),
        resolve: function resolve(comment) {
          return (0, _reddit.getUser)(comment.data.author);
        }
      },
      body: {
        description: 'Body of the comment',
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
        resolve: function resolve(comment) {
          return comment.data.body;
        }
      },
      replies: {
        description: 'Replies to the comment',
        type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(commentType)),
        args: {
          depth: {
            type: _graphql.GraphQLInt,
            description: 'Maximum depth of subtrees in the thread'
          },
          limit: {
            type: _graphql.GraphQLInt,
            description: 'Maximum number of comments to return'
          }
        },
        resolve: function resolve(comment, args) {
          var linkId = comment.data.link_id.split('_')[1];
          args.comment = comment.data.id;
          return (0, _reddit.getComments)(comment.data.subreddit, linkId, args).then(function (data) {
            return data[1].data.children;
          });
        }
      }
    };
  }
});

var linkType = new _graphql.GraphQLObjectType({
  name: 'RedditLink',
  description: 'A link posted to a subreddit',
  fields: {
    title: {
      description: 'Title of the link',
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      resolve: function resolve(link) {
        return link.data.title;
      }
    },
    fullnameId: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The Reddit API fullname of the link',
      resolve: function resolve(link) {
        return link.kind + '_' + link.data.id;
      }
    },
    score: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Score of the link',
      resolve: function resolve(link) {
        return link.data.score;
      }
    },
    numComments: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Number of comments',
      resolve: function resolve(link) {
        return link.data.num_comments;
      }
    },
    url: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'URL of the link',
      resolve: function resolve(link) {
        return link.data.url;
      }
    },
    author: {
      type: new _graphql.GraphQLNonNull(userType),
      description: 'Author of the link',
      resolve: function resolve(link) {
        return (0, _reddit.getUser)(link.data.author);
      }
    },
    comments: {
      type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(commentType)),
      description: 'Comments on the link',
      args: {
        depth: {
          type: _graphql.GraphQLInt,
          description: 'Maximum depth of subtrees in the thread'
        },
        limit: {
          type: _graphql.GraphQLInt,
          description: 'Maximum number of comments to return'
        }
      },
      resolve: function resolve(link, args) {
        return (0, _reddit.getComments)(link.data.subreddit, link.data.id, args).then(function (data) {
          return data[1].data.children;
        });
      }
    }
  }
});

var subredditType = new _graphql.GraphQLObjectType({
  name: 'RedditSubreddit',
  description: 'Information about and listings in a subreddit',
  fields: {
    name: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Name of the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.data.display_name;
      }
    },
    fullnameId: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The Reddit API fullname of the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.kind + '_' + subreddit.data.id;
      }
    },
    title: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Title of the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.data.title;
      }
    },
    publicDescription: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Description of the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.data.public_description;
      }
    },
    accountsActive: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Accounts active right now on the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.data.accounts_active;
      }
    },
    subscribers: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Number of subscribers to the subreddit',
      resolve: function resolve(subreddit) {
        return subreddit.data.subscribers;
      }
    },
    created: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'Creation date of the subreddit, in Unix Time (UTC)',
      resolve: function resolve(subreddit) {
        return subreddit.data.created_utc;
      }
    },
    createdISO: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Creation date of the subreddit, in ISO8601',
      resolve: function resolve(subreddit) {
        var date = new Date(subreddit.data.created_utc * 1000);
        return date.toISOString();
      }
    },
    hotListings: createListingField('Hot/"Front Page" listings of the subreddit', 'hot'),
    newListings: createListingField('Newest listings of the subreddit', 'new'),
    risingListings: createListingField('Rising listings of the subreddit', 'rising'),
    controversialListings: createListingField('Controversial listings of the subreddit', 'controversial', { hasTimeInterval: true }),
    topListings: createListingField('Top listings of the subreddit', 'controversial', { hasTimeInterval: true })
  }
});

var redditType = new _graphql.GraphQLObjectType({
  name: 'RedditAPI',
  description: 'The Reddit API',
  fields: {
    subreddit: {
      type: subredditType,
      args: {
        name: {
          description: 'Name of the subreddit',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref2) {
        var name = _ref2.name;

        return (0, _reddit.getSubreddit)(name);
      }
    },
    user: {
      type: userType,
      args: {
        username: {
          description: 'Username of the user',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref3) {
        var username = _ref3.username;

        return (0, _reddit.getUser)(username);
      }
    }
  }
});

var QueryObjectType = exports.QueryObjectType = redditType;