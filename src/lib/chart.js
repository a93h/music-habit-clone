var defaults = require('./defaults');

var Chart = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Chart.prototype.getLovedTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'tracks');
	return await this.lastfm.api.request('chart.getLovedTracks', options);
};

Chart.prototype.getTopArtists = async function (params) {
	var options = defaults.defaultOptions(params, 'artists');
	return await this.lastfm.api.request('chart.getTopArtists', options);
};

Chart.prototype.getTopTags = async function (params) {
	var options = defaults.defaultOptions(params, 'tags');
	return await this.lastfm.api.request('chart.getTopTags', options);
};

Chart.prototype.getTopTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'tracks');
	return await this.lastfm.api.request('chart.getTopTracks', options);
};
