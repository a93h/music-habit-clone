const  xml2json = require('xml2json')
    , querystring = require('querystring')
    , crypto = require("crypto")
    , _ = require('underscore')
    , got = require('got');

var WRITE_METHODS = ["album.addtags", "album.removetag", "album.share",
        "artist.addtags", "artist.removetag", "artist.share", "artist.shout",
        "auth.getmobilesession",
        "event.attend", "event.share", "event.shout",
        "library.addalbum", "library.addartist", "library.addtrack",
        "library.removealbum", "library.removeartist", "library.removetrack", "library.removescrobble",
        "playlist.addtrack", "playlist.create",
        "radio.tune",
        "track.addtags", "track.ban", "track.love", "track.removetag",
        "track.scrobble", "track.share", "track.unban", "track.unlove",
        "track.updatenowplaying",
        "user.shout"],
    SIGNED_METHODS = ["auth.getmobilesession", "auth.getsession", "auth.gettoken",
        "radio.getplaylist",
        "user.getrecentstations", "user.getrecommendedartists", "user.getrecommendedevents"];

var LastFmRequest = module.exports = async function(lastfm, method, params) {
  var that = this;
  params = params || {};
  return await sendRequest(lastfm.secure, lastfm.host, lastfm.url, params);

  async function sendRequest(secure, host, url, params) {
    params.method = method
    var conn = "http"
    var options = {}
    if (secure) conn = "https"
    var httpVerb = ( isWriteRequest(method) ) ? "POST" : "GET"
    var req_params = buildRequestParams(params);
    var data = buildRequestString(req_params)
    options.method = httpVerb
    if (httpVerb === "POST") {
      options.body = data
    } else url += "?" + data
    const final_url = conn + "://" + host + url
    options.headers = requestHeaders(httpVerb, host, data)
    try {
      const response = await got(final_url, options)
      //console.log(host + ":: " + response.body);
      const txt = response.body
      var json_obj = null
      try {
        json_obj = JSON.parse(txt)
      } catch (err0) {
        try {
          json_obj = xml2json.toJson(txt, {object: true})
        } catch (err1) {
          console.warn(err0.message)
          console.trace(err0)
          console.error(err1.message)
          console.trace(err1)
        }
      }
    } catch (error) {
      console.log(host + ":: return:: " + error.response.body);
      console.log(host + ":: sent:: " + data);
      //=> 'Internal server error ...'
    }
    return json_obj
  }

  function buildRequestParams(params) {
    var request_params = filterParams(params,["write","signed"])
    request_params.api_key = params.api_key || lastfm.api_key;
    request_params.format = params.format || lastfm.format;
    if (params.track && typeof params.track === "object") {
      request_params.artist = params.track.artist["#text"];
      request_params.track = params.track.name;
      if (params.track.mbid) {
        request_params.mbid = params.track.mbid;
      }
      if (params.track.album) {
        request_params.album = params.album || params.track.album["#text"];
      }
      if (params.track.trackNumber) {
        request_params.trackNumber = params.trackNumber || params.track.trackNumber["#text"];
      }
    }
    if (requiresSignature(params.method)) {
      request_params.api_sig = createSignature(request_params, lastfm.secret);
    }
    return request_params;
  }

  function requiresSignature(method) {
    return params.signed || isWriteRequest(method) || isSignedMethod(method);
  }

  function isWriteRequest(method) {
    return params.write || isWriteMethod(method);
  }

  function isSignedMethod(method) {
    return method && _(SIGNED_METHODS).include(method.toLowerCase());
  }

  function isWriteMethod(method) {
    return method && _(WRITE_METHODS).include(method.toLowerCase());
  }

  function requestHeaders(httpVerb, host, data) {
    var headers = {
      "User-Agent": lastfm.useragent
    };
    if (httpVerb === "POST") {
      headers["Content-Type"] = 'application/x-www-form-urlencoded';
      headers["Content-Length"] = data.length.toString()
    }
    return headers;
  }
  
  function buildRequestString(o) {
    var form = [];
    for (var k in o) {
      var encK= encodeURIComponent(k);
      var encV = encodeURIComponent(o[k]);
      form.push(encK + "=" + encV);
    }
    return form.join('&');
  }

  function filterParams(parameters, blacklist) {
    var filteredParams = {};
    _(parameters).each(function(value, key) {
      if (isBlackListed(key)) {
        return;
      }
      filteredParams[key] = value;
    });
    return filteredParams;
    
    function isBlackListed(name) {
      return _(blacklist).include(name);
    }
  }

  function createSignature(params, secret) {
    var sig = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != "format") {
        var value = typeof params[key] !== "undefined" && params[key] !== null ? params[key] : "";
        sig += key + value;
      }
    });
    sig += secret;
    return crypto.createHash("md5").update(sig, "utf8").digest("hex");
  }
};
