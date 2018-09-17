'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _hn = require('./apis/hn');

var _graphql = require('graphql');

var getItems = function getItems(ids, _ref) {
  var offset = _ref.offset,
      limit = _ref.limit;

  if (!ids) {
    ids = [];
  }
  var promises = ids.slice(offset, offset + limit).map(function (id) {
    return (0, _hn.getItem)(id);
  });
  return Promise.all(promises);
};

var itemTypeEnum = new _graphql.GraphQLEnumType({
  name: 'ItemType',
  description: 'The type of item',
  values: {
    job: {
      value: 'job'
    },
    story: {
      value: 'story'
    },
    comment: {
      value: 'comment'
    },
    poll: {
      value: 'poll'
    },
    pollopt: {
      value: 'pollopt'
    }
  }
});

var itemType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsItem',
  description: 'Stories, comments, jobs, Ask HNs and even polls are just items. They\'re identified by their ids, which are unique integers',
  fields: function fields() {
    return {
      id: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
        description: 'The item\'s unique id.',
        resolve: function resolve(item) {
          return item.id.toString();
        }
      },
      deleted: {
        type: _graphql.GraphQLBoolean,
        description: 'if the item is deleted'
      },
      type: {
        type: new _graphql.GraphQLNonNull(itemTypeEnum),
        description: 'The type of item. One of "job", "story", "comment", "poll", or "pollopt".'
      },
      by: {
        type: new _graphql.GraphQLNonNull(userType),
        description: 'The item\'s author.',
        resolve: function resolve(item) {
          return (0, _hn.getUser)(item.by);
        }
      },
      time: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
        description: 'Creation date of the item, in Unix Time.'
      },
      timeISO: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
        description: 'Creation date of the item, in ISO8601',
        resolve: function resolve(item) {
          var date = new Date(item.time * 1000);
          return date.toISOString();
        }
      },
      text: {
        type: _graphql.GraphQLString,
        description: 'The comment, story or poll text. HTML.'
      },
      dead: {
        type: _graphql.GraphQLBoolean,
        description: 'if the item is dead'
      },
      url: {
        type: _graphql.GraphQLString,
        description: 'The URL of the story.'
      },
      score: {
        type: _graphql.GraphQLInt,
        description: 'The story\'s score, or the votes for a pollopt.'
      },
      title: {
        type: _graphql.GraphQLString,
        description: 'The title of the story, poll or job.'
      },
      kids: {
        type: new _graphql.GraphQLList(itemType),
        description: 'The item\'s comments, in ranked display order.',
        args: {
          limit: {
            description: 'Number of items to return',
            type: _graphql.GraphQLInt
          },
          offset: {
            description: 'Initial offset of number of items to return',
            type: _graphql.GraphQLInt
          }
        },
        resolve: function resolve(item) {
          var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              _ref2$offset = _ref2.offset,
              offset = _ref2$offset === undefined ? 0 : _ref2$offset,
              _ref2$limit = _ref2.limit,
              limit = _ref2$limit === undefined ? 10 : _ref2$limit;

          return getItems(item.kids, { offset: offset, limit: limit });
        }
      },
      parent: {
        type: itemType,
        description: 'The item\'s parent. For comments, either another comment or the relevant story. For pollopts, the relevant poll.',
        resolve: function resolve(item) {
          if (!item.parent) {
            return null;
          }
          return (0, _hn.getItem)(item.parent);
        }
      },
      parts: {
        type: new _graphql.GraphQLList(itemType),
        description: 'A list of related pollopts, in display order.',
        resolve: function resolve(item) {
          if (!item.parts) {
            return null;
          }
          var promises = item.parts.map(function (partId) {
            return (0, _hn.getItem)(partId);
          });
          return Promise.all(promises);
        }
      },
      descendants: {
        type: _graphql.GraphQLInt,
        description: 'In the case of stories or polls, the total comment count.'
      }
    };
  }
});

var userType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsUser',
  description: 'Users are identified by case-sensitive ids. Only users that have public activity (comments or story submissions) on the site are available through the API.',
  fields: {
    id: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The user\'s unique username. Case-sensitive. Required.'
    },
    delay: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Delay in minutes between a comment\'s creation and its visibility to other users.'
    },
    created: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt),
      description: 'Creation date of the user, in Unix Time.'
    },
    createdISO: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'Creation date of the user, in ISO8601',
      resolve: function resolve(user) {
        var date = new Date(user.created * 1000);
        return date.toISOString();
      }
    },
    about: {
      type: _graphql.GraphQLString,
      description: 'The user\'s optional self-description. HTML.'
    },
    submitted: {
      type: new _graphql.GraphQLList(itemType),
      description: 'List of the user\'s stories, polls and comments.',
      args: {
        limit: {
          description: 'Number of items to return',
          type: _graphql.GraphQLInt
        },
        offset: {
          description: 'Initial offset of number of items to return',
          type: _graphql.GraphQLInt
        }
      },
      resolve: function resolve(user) {
        var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref3$limit = _ref3.limit,
            limit = _ref3$limit === undefined ? 10 : _ref3$limit,
            _ref3$offset = _ref3.offset,
            offset = _ref3$offset === undefined ? 0 : _ref3$offset;

        var submitted = user.submitted;
        return getItems(submitted, { limit: limit, offset: offset });
      }
    }
  }
});

var createBulkType = function createBulkType(bulkAPICall, description) {
  return {
    type: new _graphql.GraphQLList(itemType),
    description: description,
    args: {
      limit: {
        description: 'Number of items to return',
        type: _graphql.GraphQLInt
      },
      offset: {
        description: 'Initial offset of number of items to return',
        type: _graphql.GraphQLInt
      }
    },
    resolve: function resolve(root) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$limit = _ref4.limit,
          limit = _ref4$limit === undefined ? 30 : _ref4$limit,
          _ref4$offset = _ref4.offset,
          offset = _ref4$offset === undefined ? 0 : _ref4$offset;

      return bulkAPICall().then(function (ids) {
        return getItems(ids, { limit: limit, offset: offset });
      });
    }
  };
};

var hnType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsAPI',
  description: 'The Hacker News V0 API',
  fields: {
    item: {
      type: itemType,
      args: {
        id: {
          description: 'id of the item',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
        }
      },
      resolve: function resolve(root, _ref5) {
        var id = _ref5.id;

        return (0, _hn.getItem)(id);
      }
    },
    user: {
      type: userType,
      args: {
        id: {
          description: 'id of the user',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref6) {
        var id = _ref6.id;

        return (0, _hn.getUser)(id);
      }
    },
    topStories: createBulkType(_hn.getTopStoryIds, 'Up to 500 of the top stories'),
    newStories: createBulkType(_hn.getNewStoryIds, 'Up to 500 of the newest stories'),
    showStories: createBulkType(_hn.getShowStoryIds, 'Up to 200 of the Show HN stories'),
    askStories: createBulkType(_hn.getAskStoryIds, 'Up to 200 of the Ask HN stories'),
    jobStories: createBulkType(_hn.getJobStoryIds, 'Up to 200 of the Job stores'),
    stories: {
      type: new _graphql.GraphQLList(itemType),
      description: 'Return list of stories',
      args: {
        limit: {
          description: 'Number of items to return',
          type: _graphql.GraphQLInt
        },
        offset: {
          description: 'Initial offset of number of items to return',
          type: _graphql.GraphQLInt
        },
        storyType: {
          description: 'Type of story to list',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root) {
        var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref7$limit = _ref7.limit,
            limit = _ref7$limit === undefined ? 30 : _ref7$limit,
            _ref7$offset = _ref7.offset,
            offset = _ref7$offset === undefined ? 0 : _ref7$offset,
            storyType = _ref7.storyType;

        var bulkAPICall = {
          top: _hn.getTopStoryIds,
          show: _hn.getShowStoryIds,
          new: _hn.getNewStoryIds,
          ask: _hn.getAskStoryIds,
          job: _hn.getJobStoryIds
        }[storyType];
        return bulkAPICall().then(function (ids) {
          return getItems(ids, { limit: limit, offset: offset });
        });
      }
    }
  }
});

var QueryObjectType = exports.QueryObjectType = hnType;