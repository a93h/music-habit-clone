var defaults = require('./defaults');

var Library = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Library.prototype.getArtists = async function (params) {
	var options = defaults.defaultOptions(params, 'artists');
	return await this.lastfm.api.request('library.getArtists', options);
};
