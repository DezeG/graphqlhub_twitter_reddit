'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// in-memory keyvalue store
var store = {
  initialKey: 'initialValue'
};

var get = exports.get = function get(key) {
  return store[key];
};

var set = exports.set = function set(key, value) {
  if (key === 'initialKey') {
    return;
  }
  store[key] = value;
};