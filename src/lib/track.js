var defaults = require('./defaults');

var Track = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Track.prototype.addTags = async function (artist, track, tags) {
	if (!Array.isArray(tags)) { tags = [ tags ]; }
	var options = defaults.defaultOptions({
		'artist' : artist,
		'track' : track,
		'tags' : tags.join(','),
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('track.addTags', options);
};

Track.prototype.getCorrection = async function (artist, track) {
	var options = defaults.defaultOptions({
		'artist' : artist,
		'track' : track
	}, 'corrections');
	return await this.lastfm.api.request('track.getCorrection', options);
};

Track.prototype.getInfo = async function (params) {
	var options = defaults.defaultOptions(params, 'track');
	return await this.lastfm.api.request('track.getInfo', options);
};

Track.prototype.getSimilar = async function (params) {
	var options = defaults.defaultOptions(params, 'similartracks');
	return await this.lastfm.api.request('track.getSimilar', options);
};

Track.prototype.getTags = async function (params) {
	var options = defaults.defaultOptions(params, 'tags');
	return await this.lastfm.api.request('track.getTags', options);
};

Track.prototype.getTopTags = async function (params) {
	var options = defaults.defaultOptions(params, 'toptags');
	return await this.lastfm.api.request('track.getTopTags', options);
};

Track.prototype.love = async function (params) {
	var options = defaults.defaultOptions(params);
	options.sk = this.lastfm.sessionCredentials.key;
	return await this.lastfm.api.request('track.love', options);
};

Track.prototype.removeTag = async function (artist, track, tag) {
	var options = defaults.defaultOptions({
		'artist' : artist,
		'track' : track,
		'tag' : tag,
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('track.removeTag', options);
};

Track.prototype.scrobble = async function (params) {
	var i, len, key, newParams = {};
	if (Array.isArray(params)) {
		for (i = 0, len = params.length; i < len; i++) {
			for (key in params[i]) {
				newParams[key + '[' + i + ']'] = params[i][key];
			}
		}
		params = newParams;
	}
	var options = defaults.defaultOptions(params, 'scrobbles');
	options.sk = this.lastfm.sessionCredentials.key;
	return await this.lastfm.api.request('track.scrobble', options);
};

Track.prototype.search = async function (params) {
	var options = defaults.defaultOptions(params, 'results');
	return await this.lastfm.api.request('track.search', options);
};

Track.prototype.unlove = async function (artist, track) {
	var options = defaults.defaultOptions({
		'artist' : artist,
		'track' : track,
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('track.unlove', options);
};

Track.prototype.updateNowPlaying = async function (params) {
	var options = defaults.defaultOptions(params, 'nowplaying');
	options.sk = this.lastfm.sessionCredentials.key;
	return await this.lastfm.api.request('track.updateNowPlaying', options);
};
