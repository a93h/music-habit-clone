var defaults = require('./defaults');

var Geo = module.exports = function (lastfm) { this.lastfm = lastfm; };

Geo.prototype.getTopArtists = async function (params) {
	var options = defaults.defaultOptions(params, 'topartists');
	return await this.lastfm.api.request('geo.getTopArtists', options);
};

Geo.prototype.getTopTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'tracks');
	return await this.lastfm.api.request('geo.getTopTracks', options);
};
