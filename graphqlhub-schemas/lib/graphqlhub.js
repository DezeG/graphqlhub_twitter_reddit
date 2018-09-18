'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MutationsType = exports.QueryObjectType = undefined;

var _graphql = require('graphql');

var _hn = require('./hn');

var HN = _interopRequireWildcard(_hn);

var _hn2 = require('./hn2');

var HN2 = _interopRequireWildcard(_hn2);

var _reddit = require('./reddit');

var REDDIT = _interopRequireWildcard(_reddit);

var _keyvalue = require('./keyvalue');

var KEYVALUE = _interopRequireWildcard(_keyvalue);

var _github = require('./github');

var GITHUB = _interopRequireWildcard(_github);

var _twitter = require('./twitter');

var TWITTER = _interopRequireWildcard(_twitter);

var _giphy = require('./giphy');

var GIPHY = _interopRequireWildcard(_giphy);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var schemas = {
  hn: HN,
  hn2: HN2,
  reddit: REDDIT,
  keyValue: KEYVALUE,
  github: GITHUB,
  twitter: TWITTER,
  giphy: GIPHY
};

var FIELDS = {
  graphQLHub: {
    type: _graphql.GraphQLString,
    description: 'About GraphQLHub',
    resolve: function resolve() {
      return 'Use GraphQLHub to explore popular APIs with GraphQL! Created by Clay Allsopp @clayallsopp';
    }
  }
};
var MUTATION_FIELDS = {};

Object.keys(schemas).forEach(function (schemaName) {
  var Mutations = schemas[schemaName].Mutations;

  var mutations = Mutations;
  if (mutations) {
    Object.keys(mutations).forEach(function (mutationName) {
      var fixedName = schemaName + '_' + mutationName;
      MUTATION_FIELDS[fixedName] = mutations[mutationName];
    });
  }
  FIELDS[schemaName] = {
    type: schemas[schemaName].QueryObjectType,
    resolve: function resolve() {
      return {};
    }
  };
});

var queryObjectType = new _graphql.GraphQLObjectType({
  name: 'GraphQLHubAPI',
  description: 'APIs exposed as GraphQL',
  fields: function fields() {
    return FIELDS;
  }
});

var mutationsType = new _graphql.GraphQLObjectType({
  name: 'GraphQLHubMutationAPI',
  description: 'APIs exposed as GraphQL mutations',
  fields: function fields() {
    return MUTATION_FIELDS;
  }
});

var QueryObjectType = exports.QueryObjectType = queryObjectType;
var MutationsType = exports.MutationsType = mutationsType;