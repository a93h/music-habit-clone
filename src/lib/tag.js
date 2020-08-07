var defaults = require('./defaults');

var Tag = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Tag.prototype.getInfo = async function (tag, lang) {
	if (typeof callback !== 'function') { callback = lang; lang = null; }
	var options = defaults.defaultOptions({
		'tag' : tag,
		'lang' : lang
	}, 'tag');
	return await this.lastfm.api.request('tag.getInfo', options);
};

Tag.prototype.getSimilar = async function (tag) {
	var options = defaults.defaultOptions({ 'tag' : tag }, 'similartags');
	return await this.lastfm.api.request('tag.getSimilar', options);
};

Tag.prototype.getTopAlbums = async function (params) {
	var options = defaults.defaultOptions(params, 'topalbums');
	return await this.lastfm.api.request('tag.getTopAlbums', options);
};

Tag.prototype.getTopArtists = async function (params) {
	var options = defaults.defaultOptions(params, 'topartists');
	return await this.lastfm.api.request('tag.getTopArtists', options);
};

Tag.prototype.getTopTags = async function (callback) {
	var options = defaults.defaultOptions(null, 'toptags');
	return await this.lastfm.api.request('tag.getTopTags', options);
};

Tag.prototype.getTopTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'toptracks');
	return await this.lastfm.api.request('tag.getTopTracks', options);
};

Tag.prototype.getWeeklyChartList = async function (tag) {
	var options = defaults.defaultOptions({ 'tag' : tag }, 'weeklychartlist');
	return await this.lastfm.api.request('tag.getWeeklyChartList', options);
};
