'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mutations = exports.QueryObjectType = undefined;

var _keyvalue = require('./apis/keyvalue');

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

var itemType = new _graphql.GraphQLObjectType({
  name: 'KeyValueItem',
  description: 'Item for a key-value pair',
  fields: {
    id: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The item\'s unique id.',
      resolve: function resolve(item) {
        return item.id.toString();
      }
    },
    value: {
      type: _graphql.GraphQLString,
      description: 'The item\'s value.',
      resolve: function resolve(item) {
        return item.value;
      }
    }
  }
});

var getValueItem = function getValueItem(id) {
  var value = (0, _keyvalue.get)(id);
  return {
    id: id,
    value: value
  };
};

var keyvalueType = new _graphql.GraphQLObjectType({
  name: 'KeyValueAPI',
  description: 'An in-memory key-value store',
  fields: {
    getValue: {
      type: itemType,
      args: {
        id: {
          description: 'id of the item',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref) {
        var id = _ref.id;

        return getValueItem(id);
      }
    }

  }
});

var SetValueReturnType = new _graphql.GraphQLObjectType({
  name: 'SetValueReturnType',
  fields: {
    item: {
      type: itemType,
      resolve: function resolve(root) {
        return root;
      }
    }
  }
});

var SetValueForKeyMutation = (0, _graphqlRelay.mutationWithClientMutationId)({
  name: 'SetValueForKey',
  inputFields: {
    id: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
    },
    value: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
    }
  },
  outputFields: {
    item: {
      type: itemType,
      resolve: function resolve(_ref2) {
        var id = _ref2.id;

        return getValueItem(id);
      }
    }
  },
  mutateAndGetPayload: function mutateAndGetPayload(_ref3) {
    var id = _ref3.id,
        value = _ref3.value;

    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        (0, _keyvalue.set)(id, value);
        resolve({ id: id });
      }, 2 * 1000);
    });
  }
});

var mutations = {
  setValue: SetValueForKeyMutation
};

var QueryObjectType = exports.QueryObjectType = keyvalueType;
var Mutations = exports.Mutations = mutations;