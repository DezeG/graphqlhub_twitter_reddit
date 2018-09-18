'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _hn = require('./apis/hn');

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

var itemTypeName = 'item';

var ConnectionTypes = {};
var getConnectionType = function getConnectionType(nodeType) {
  if (!ConnectionTypes[nodeType]) {
    ConnectionTypes[nodeType] = (0, _graphqlRelay.connectionDefinitions)({ nodeType: nodeType }).connectionType;
  }
  return ConnectionTypes[nodeType];
};

var connectionFromIdsArray = function connectionFromIdsArray(allIds, args, resolveIds) {
  var connection = (0, _graphqlRelay.connectionFromArray)(allIds || [], args);
  var ids = connection.edges.map(function (edge) {
    return edge.node;
  });
  var promise = Promise.resolve(resolveIds(ids));

  return promise.then(function (values) {
    connection.edges.forEach(function (edge, index) {
      edge.node = values[index];
    });
    return connection;
  });
};

var kidsField = function kidsField() {
  return {
    type: getConnectionType(CommentType),
    description: 'The item\'s comments, in ranked display order.',
    args: _graphqlRelay.connectionArgs,
    resolve: function resolve(item, args) {
      return connectionFromIdsArray(item.kids, args, function (ids) {
        return Promise.all(ids.map(_hn.getItem));
      });
    }
  };
};

var itemFields = function itemFields() {
  return {
    hnId: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The item\'s unique id.',
      resolve: function resolve(item) {
        return item.id.toString();
      }
    },
    id: (0, _graphqlRelay.globalIdField)(itemTypeName),
    deleted: {
      type: _graphql.GraphQLBoolean,
      description: 'if the item is deleted'
    },
    by: {
      type: new _graphql.GraphQLNonNull(UserType),
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
    parent: {
      type: nodeInterface,
      description: 'The item\'s parent. For comments, either another comment or the relevant story. For pollopts, the relevant poll.',
      resolve: function resolve(item) {
        if (!item.parent) {
          return null;
        }
        return (0, _hn.getItem)(item.parent);
      }
    },

    descendants: {
      type: _graphql.GraphQLInt,
      description: 'In the case of stories or polls, the total comment count.'
    }
  };
};

var _nodeDefinitions = (0, _graphqlRelay.nodeDefinitions)(function (globalId) {
  var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(globalId),
      type = _fromGlobalId.type,
      id = _fromGlobalId.id;

  if (type === 'HackerNewsV2User') {
    return (0, _hn.getUser)(id);
  }
  return (0, _hn.getItem)(id);
}, function (obj) {
  if (typeof obj.karma !== 'undefined') {
    return UserType;
  }
  return {
    job: JobType,
    story: StoryType,
    comment: CommentType,
    poll: PollType,
    pollopt: PollPartType
  }[obj.type] || StoryType;
}),
    nodeInterface = _nodeDefinitions.nodeInterface,
    nodeField = _nodeDefinitions.nodeField;

var StoryType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2Story',
  fields: function fields() {
    return {
      id: itemFields().id,
      hnId: itemFields().hnId,
      by: itemFields().by,
      descendants: itemFields().descendants,
      score: itemFields().score,
      time: itemFields().time,
      timeISO: itemFields().timeISO,
      title: itemFields().title,
      url: itemFields().url,
      text: itemFields().text,
      kids: kidsField(CommentType),
      deleted: itemFields().deleted,
      dead: itemFields().dead
    };
  },
  interfaces: [nodeInterface]
});

var JobType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2Job',
  fields: function fields() {
    return {
      id: itemFields().id,
      hnId: itemFields().hnId,
      by: itemFields().by,
      score: itemFields().score,
      text: itemFields().text,
      time: itemFields().time,
      timeISO: itemFields().timeISO,
      title: itemFields().title,
      url: itemFields().url,
      deleted: itemFields().deleted,
      dead: itemFields().dead
    };
  },
  interfaces: [nodeInterface]
});

var PollType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2Poll',
  fields: function fields() {
    return {
      id: itemFields().id,
      hnId: itemFields().hnId,
      by: itemFields().by,
      descendants: itemFields().descendants,
      score: itemFields().score,
      time: itemFields().time,
      timeISO: itemFields().timeISO,
      title: itemFields().title,
      text: itemFields().text,
      kids: kidsField(CommentType),
      deleted: itemFields().deleted,
      dead: itemFields().dead,
      parts: {
        type: new _graphql.GraphQLList(PollPartType),
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
      }
    };
  },
  interfaces: [nodeInterface]
});

var CommentType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2Comment',
  fields: function fields() {
    return {
      id: itemFields().id,
      hnId: itemFields().hnId,
      by: itemFields().by,
      parent: itemFields().parent,
      text: itemFields().text,
      time: itemFields().time,
      timeISO: itemFields().timeISO,
      kids: kidsField(CommentType),
      deleted: itemFields().deleted,
      dead: itemFields().dead
    };
  },
  interfaces: [nodeInterface]
});

var PollPartType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2PollPart',
  fields: function fields() {
    return {
      id: itemFields().id,
      hnId: itemFields().hnId,
      by: itemFields().by,
      score: itemFields().score,
      time: itemFields().time,
      timeISO: itemFields().timeISO,
      text: itemFields().text,
      parent: itemFields().parent,
      deleted: itemFields().deleted
    };
  },
  interfaces: [nodeInterface]
});

var UserType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsV2User',
  fields: function fields() {
    return {
      id: (0, _graphqlRelay.globalIdField)(),
      hnId: itemFields().hnId,
      delay: {
        type: _graphql.GraphQLInt,
        description: 'Delay in minutes between a comment\'s creation and its visibility to other users.'
      },
      created: {
        type: _graphql.GraphQLInt,
        description: 'Creation date of the user, in Unix Time.'
      },
      createdISO: {
        type: _graphql.GraphQLString,
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
        type: getConnectionType(nodeInterface),
        description: 'List of the user\'s stories, polls and comments.',
        args: _graphqlRelay.connectionArgs,
        resolve: function resolve(user, args) {
          return connectionFromIdsArray(user.submitted, args, function (ids) {
            return Promise.all(ids.map(_hn.getItem));
          });
        }
      }
    };
  },
  interfaces: [nodeInterface]
});

var hnType = new _graphql.GraphQLObjectType({
  name: 'HackerNewsAPIV2',
  description: 'The Hacker News V2 API; this is Relay-compatible (uses Nodes and Connections)',
  fields: {
    node: nodeField,

    nodeFromHnId: {
      type: new _graphql.GraphQLNonNull(nodeInterface),
      description: 'To ensure Node IDs are globally unique, GraphQLHub coerces ' + 'IDs returned by the HN API. Use this field to get nodes via normal HN IDs',
      args: {
        id: {
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        },
        isUserId: {
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLBoolean)
        }
      },
      resolve: function resolve(source, args, context, info) {
        var typeName = args.isUserId ? UserType.name : itemTypeName;
        var id = (0, _graphqlRelay.toGlobalId)(typeName, args.id);
        return nodeField.resolve(source, { id: id }, context, info);
      }
    }
  }
});

console.log(UserType);

var QueryObjectType = exports.QueryObjectType = hnType;