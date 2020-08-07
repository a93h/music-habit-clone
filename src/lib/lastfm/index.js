var LastFmRequest = require("./lastfm-request");

var LastFmNode = exports.LastFmNode = function(options) {
  options = options || {};
  this.secure = options.secure
  this.url = "/2.0";
  this.host = options.host || "ws.audioscrobbler.com";
  this.format = options.format || "json";
  this.secret = options.secret;
  this.api_key = options.api_key;
  this.useragent = options.useragent || "lastfm-node";
};

LastFmNode.prototype.request = function(method, params) {
  return new LastFmRequest(this, method, params);
};
