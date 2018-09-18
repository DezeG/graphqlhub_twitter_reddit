'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryObjectType = undefined;

var _giphy = require('./apis/giphy');

var _giphy2 = _interopRequireDefault(_giphy);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GiphyRatingType = new _graphql.GraphQLEnumType({
  name: 'GiphyRatingType',
  description: 'The rating of a GIF',
  values: {
    y: {
      value: 'y'
    },
    g: {
      value: 'g'
    },
    pg: {
      value: 'pg'
    },
    'pg13': {
      value: 'pg-13'
    },
    r: {
      value: 'r'
    }
  }
});

var makeImageType = function makeImageType(name, nonNullFields) {
  var fields = {};
  nonNullFields.forEach(function (fieldName) {
    fields[fieldName] = {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
    };
  });
  return {
    type: new _graphql.GraphQLObjectType({
      name: 'GiphyGIFImageData' + name,
      fields: fields
    })
  };
};

var imageDataTypes = {
  fixed_height: makeImageType('FixedHeight', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size']),
  fixed_height_still: makeImageType('FixedHeightStill', ['url', 'width', 'height']),
  fixed_height_downsampled: makeImageType('FixedHeightDownsample', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_width: makeImageType('FixedWidth', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size']),
  fixed_width_still: makeImageType('FixedWidthStill', ['url', 'width', 'height']),
  fixed_width_downsampled: makeImageType('FixedWidthDownsample', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_height_small: makeImageType('FixedHeightSmall', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_height_small_still: makeImageType('FixedHeightSmallStill', ['url', 'width', 'height']),
  fixed_width_small: makeImageType('FixedWidthSmall', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_width_small_still: makeImageType('FixedWidthSmallStill', ['url', 'width', 'height']),
  downsized: makeImageType('Downsized', ['url', 'width', 'height', 'small']),
  downsized_still: makeImageType('DownsizedStill', ['url', 'width', 'height']),
  downsized_large: makeImageType('DownsizedLarge', ['url', 'width', 'height', 'size']),
  original: makeImageType('Original', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size', 'frames']),
  original_still: makeImageType('OriginalStill', ['url', 'width', 'height']),
  looping: makeImageType('Looping', ['mp4'])
};

var gifImagesType = new _graphql.GraphQLObjectType({
  name: 'GiphyGIFImages',
  fields: imageDataTypes
});

var gifDataType = new _graphql.GraphQLObjectType({
  name: 'GiphyGIFData',
  fields: {
    id: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString),
      description: 'The item\'s unique id.'
    },
    url: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
    },
    images: {
      type: new _graphql.GraphQLNonNull(gifImagesType)
    }
  }
});

var takeKeysWithPrefix = function takeKeysWithPrefix(prefix, data) {
  var keys = Object.keys(data).filter(function (key) {
    return key.indexOf(prefix) === 0;
  });
  var newData = {};
  keys.forEach(function (key) {
    var truncatedKey = key.split(prefix)[1];
    newData[truncatedKey] = data[key];
  });
  return newData;
};

// for some reason, Random has a different format than search
var transformRandom = function transformRandom(randomData) {
  if (!randomData) {
    return undefined;
  }

  var imageData = {
    original: takeKeysWithPrefix('image_', randomData),
    fixed_height_downsampled: takeKeysWithPrefix('fixed_height_downsampled_', randomData),
    fixed_width_downsampled: takeKeysWithPrefix('fixed_width_downsampled_', randomData),
    fixed_height_small: takeKeysWithPrefix('fixed_height_small_', randomData),
    fixed_width_small: takeKeysWithPrefix('fixed_width_small_', randomData)
  };

  var gifData = Object.assign({}, randomData, { images: imageData });
  return gifData;
};

var giphyType = new _graphql.GraphQLObjectType({
  name: 'GiphyAPI',
  fields: {
    gif: {
      type: gifDataType,
      args: {
        id: {
          description: 'id of the item',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        }
      },
      resolve: function resolve(root, _ref) {
        var id = _ref.id;

        return _giphy2.default.id(id).then(function (res) {
          return res.data[0];
        });
      }
    },
    search: {
      type: new _graphql.GraphQLList(gifDataType),
      args: {
        query: {
          description: 'Search query or phrase',
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLString)
        },
        limit: {
          type: _graphql.GraphQLInt
        },
        offset: {
          type: _graphql.GraphQLInt
        },
        rating: {
          type: GiphyRatingType
        }
      },
      resolve: function resolve(root, _ref2) {
        var query = _ref2.query,
            limit = _ref2.limit,
            offset = _ref2.offset,
            rating = _ref2.rating;

        var apiOptions = {
          q: query,
          limit: limit,
          offset: offset,
          rating: rating
        };
        return _giphy2.default.search(apiOptions).then(function (res) {
          return res.data;
        });
      }
    },
    random: {
      type: gifDataType,
      args: {
        tag: {
          description: 'the GIF tag to limit randomness by',
          type: _graphql.GraphQLString
        },
        rating: {
          type: GiphyRatingType
        }
      },
      resolve: function resolve(root, _ref3) {
        var tag = _ref3.tag,
            rating = _ref3.rating;

        var apiOptions = {
          tag: tag,
          rating: rating
        };
        return _giphy2.default.random(apiOptions).then(function (res) {
          return transformRandom(res.data);
        });
      }
    }
  }
});

var QueryObjectType = exports.QueryObjectType = giphyType;