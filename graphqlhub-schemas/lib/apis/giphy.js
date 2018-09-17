'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _giphyApi = require('giphy-api');

var _giphyApi2 = _interopRequireDefault(_giphyApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var giphy = (0, _giphyApi2.default)({
  apiKey: process.env.GIPHY_API_KEY
});

exports.default = giphy;