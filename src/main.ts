import { isNullOrUndefined } from "util";

var fs = require('fs')
var dotenv = require('dotenv')
var cron = require('node-cron')
var md5 = require('md5')

// ** BEGIN EDIT HERE **************************************************

const result = dotenv.config()
  
if (result.error) {
  throw result.error
}

const cfg = {
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  LASTFM_API_SECRET: process.env.LASTFM_API_SECRET,
  LIBREFM_API_KEY: process.env.LIBREFM_API_KEY,
  LIBREFM_API_SECRET: process.env.LIBREFM_API_SECRET,
  LISTENBRAINZ_API_KEY: process.env.LISTENBRAINZ_API_KEY,
  LISTENBRAINZ_API_SECRET: process.env.LISTENBRAINZ_API_SECRET,
  SRC_TYPE: parseInt(process.env.SRC_TYPE),
  SRC_NAME: process.env.SRC_NAME,
  DEST_NAME_LASTFM: process.env.DEST_NAME_LASTFM,
  DEST_PWD_LASTFM: process.env.DEST_PWD_LASTFM,
  DEST_NAME_LIBREFM: process.env.DEST_NAME_LIBREFM,
  DEST_PWD_LIBREFM: process.env.DEST_PWD_LIBREFM,
  DEST_NAME_LISTENBRAINZ: process.env.DEST_NAME_LISTENBRAINZ,
  DEST_PWD_LISTENBRAINZ: process.env.DEST_PWD_LISTENBRAINZ,
  DELAY: parseInt(process.env.DELAY)
}

// ** END EDIT HERE ****************************************************

if ((cfg.SRC_TYPE == 0 || cfg.DEST_NAME_LASTFM) && (!cfg.LASTFM_API_KEY || !cfg.LASTFM_API_SECRET )) {
	console.log('Please edit `LASTFM_API_KEY` and `LASTFM_API_SECRET` before running this example.');
	console.log('If you don\'t have an API key, get one here: http://www.last.fm/api/account/create');
	process.exit(1);
}

if ((cfg.SRC_TYPE == 1 || cfg.DEST_NAME_LIBREFM) && (!cfg.LIBREFM_API_KEY || !cfg.LIBREFM_API_SECRET )) {
	console.log('Please edit `LIBREFM_API_KEY` and `LIBREFM_API_SECRET` before running this example.');
	console.log('If you don\'t have an API key make up a 32 alphnumeric key and secret');
  process.exit(1);
}

if ((cfg.SRC_TYPE == 2 || cfg.DEST_NAME_LISTENBRAINZ) && (!cfg.DEST_PWD_LISTENBRAINZ)) {
	console.log('Please edit `LISTENBRAINZ_API_KEY` and `LISTENBRAINZ_API_SECRET` before running this example.');
	console.log('If you don\'t have an API key, get one here: https://musicbrainz.org/account/applications/register');
	process.exit(1);
}

var LastfmAPI = require('./lib/lastfmapi');
var { ListenBrainzAPI, Session, Listen, Now_Playing_Payload, Listens_Payload, ListenType } = require('./lib/listenbrainzapi')

var lastfm = new LastfmAPI({
	'api_key' : cfg.LASTFM_API_KEY,
  'secret' : cfg.LASTFM_API_SECRET,
  'secure' : true,
  'useragent': 'music-habit-clone/v0.0.0 lastfm'
});

var librefm = new LastfmAPI({
  'api_key' : cfg.LIBREFM_API_KEY,
  'secret' : cfg.LIBREFM_API_SECRET,
  'host' : 'libre.fm',
  'secure': true,
  'useragent': 'music-habit-clone/v0.0.0 librefm'
})

function fromLFMToLFM(lfm: any) {
  let lfmo: typeof Listen = {}
  lfmo.artist = lfm.artist['#text']
  lfmo.track = lfm.name
  if (!isNullOrUndefined(lfm.date) &&
        lfm.date !== "")
    lfmo.timestamp = lfm.date.uts
  var album: string = lfm.album['#text']
  if (!isNullOrUndefined(album) && album !== "")
    lfmo.album = album
  if (!isNullOrUndefined(lfm.mbid) && lfm.mbid !== "")
    lfmo.mbid = lfm.mbid
  if (!isNullOrUndefined(lfm.trackNumber))
    lfmo.trackNumber = lfm.trackNumber
  return lfmo
}

function fromLBZToLBZ(lbz: any) {
  let lbzo: typeof Listen = {}
  lbzo.listened_at = lbz.listened_at
  lbzo.track_metadata = lbz.track_metadata
  return lbzo
}

function trackFromFMToLBZ(lfm: any) { // from last.fm/libre.fm to ListenBrainz
    let lbz: typeof Listen = {}
    lbz.listened_at = lfm.date.uts
    lbz.track_metadata = {}
    lbz.track_metadata.artist_name = lfm.artist['#text']
    lbz.track_metadata.track_name = lfm.name
    lbz.track_metadata.additional_info = {}
    let mbid: string = lfm.artist['mbid']
    if (!isNullOrUndefined(mbid) && mbid !== "")
      lbz.track_metadata.additional_info.artist_mbids = [mbid]
    mbid = lfm.album['mbid']
    if (!isNullOrUndefined(mbid) && mbid !== "")
      lbz.track_metadata.additional_info.release_mbid = mbid
    mbid = lfm.mbid
    if (!isNullOrUndefined(mbid) && mbid !== "")
      lbz.track_metadata.additional_info.track_mbid = mbid
    let release: string = lfm.album['#text']
    if (!isNullOrUndefined(release) && release !== "")
      lbz.track_metadata.release_name = release
    if (!isNullOrUndefined(lfm.trackNumber))
      lbz.track_metadata.additional_info.tracknumber = lfm.trackNumber
    return lbz
}

function trackFromLBZToFM(lbz: typeof Listen) {
  let lfm: any = {}
  if (!isNullOrUndefined(lbz.listened_at))
    lfm.timestamp = lbz.listened_at
  lfm.artist = lbz.track_metadata.artist_name
  lfm.track = lbz.track_metadata.track_name
  let album: string = lbz.track_metadata.release_name
  if (isNullOrUndefined(album) && album !== "")
     lfm.album = album
  let add_info_is: boolean =
    lbz.track_metadata.additional_info ? true: false
  if (add_info_is) {
    let mbid : string = ""
    mbid = lbz.track_metadata.additional_info.track_mbid 
    if (!isNullOrUndefined(mbid) && mbid !== "")
      lfm.mbid = mbid
    let tn: any = lbz.track_metadata.additional_info.tracknumber 
    if (!isNullOrUndefined(tn))
      lfm.trackNumber = tn
  }
  return lfm
}

async function main() {
  var cfg_f: string = 'config.json'
  var config_file = null 
  if (fs.existsSync(cfg_f)) {
    config_file = await fs.promises.open(cfg_f, 'r+')
  }
  const txt = await config_file.readFile("utf8")
  await config_file.close()
  var json = null 
  try {
     json = JSON.parse(txt)
  } catch (err) {
    json = {}
    console.warn('config.json is not json (yet)')
  }
  let new_creds: boolean = false
  if (cfg.DEST_NAME_LASTFM) {
    if (isNullOrUndefined(json) || isNullOrUndefined(json.lastfm)) {
      var creds = await lastfm.authenticateMobile(cfg.DEST_NAME_LASTFM, cfg.DEST_PWD_LASTFM)
      json.lastfm = {}
      json.lastfm.name = creds.session.name
      json.lastfm.key = creds.session.key
      new_creds = true
    } else {
      lastfm.setSessionCredentials(json.lastfm.name,json.lastfm.key)
    }
  }
  if (cfg.DEST_NAME_LIBREFM) {
    if (isNullOrUndefined(json) || isNullOrUndefined(json.librefm)) {
      var creds = await librefm.authenticateMobileLibreFM(cfg.DEST_NAME_LIBREFM, md5(((cfg.DEST_NAME_LIBREFM).toLowerCase()+md5(cfg.DEST_PWD_LIBREFM))))
      json.librefm = {}
      json.librefm.name = creds.session.name
      json.librefm.key = creds.session.key
      new_creds = true
    } else {
      librefm.setSessionCredentials(json.librefm.name,json.librefm.key)
    }
  }
  if (new_creds) {
    try {
        config_file = await fs.promises.open(cfg_f, 'w+')
        await config_file.writeFile(JSON.stringify(json))
        await config_file.close()
    } catch (err) {
      console.error('Failled to write config file')
    }
  }
  let s: typeof Session = {
    token: cfg.DEST_PWD_LISTENBRAINZ,
    api_key: cfg.LISTENBRAINZ_API_KEY,
    secret: cfg.LISTENBRAINZ_API_SECRET,
    url: null
  }

  var listenbrainz: any = null
  
  if (cfg.DEST_NAME_LISTENBRAINZ) {
    listenbrainz = new ListenBrainzAPI(s)
    await listenbrainz.Validate_Token()
  }

  var src = null

  switch(cfg.SRC_TYPE){
    case 0:
      src = lastfm
      break
    case 1:
      src = librefm
      break
    case 2:
      src = listenbrainz
      break
    default:
      throw Error("invalid SRC_TYPE in .env")
  }
  var tracks_1, tracks_2, now_plays_1, now_plays_2 = null
  var last_tr_1, last_tr_2, last_np_1, last_np_2 = null
  var cur_t = null
  var las_t = Math.round(Date.now()/1000)
  var cron_time = '*/' + cfg.DELAY.toString() + ' * * * * *'
  console.log(cron_time)
  if (!cron.validate(cron_time)) {
    throw Error("Check cfg.DELAY= in .env")
  }
  var task = cron.schedule(cron_time, async () => {
    try {
      let np_flag = false
      if(cfg.SRC_TYPE==2) {
        var src_tr : typeof Listens_Payload = await src.Listens(cfg.SRC_NAME,1)
        if (isNullOrUndefined(src_tr))  {
          console.warn('Null source track received')
        } else {
          var len = Object.keys(src_tr.payload.listens).length
          if (len < 1) {
            console.warn('Not enough listen data for current track')
          } else {
            tracks_2 = fromLBZToLBZ(src_tr.payload.listens[0])
            tracks_1 = trackFromLBZToFM(tracks_2)
          }
        }
        var src_np : typeof Now_Playing_Payload = await src.Playing_Now(cfg.SRC_NAME)
        if (isNullOrUndefined(src_np))  {
          console.warn('Null source now playing received')
        } else {
          var len = Object.keys(src_np.payload.listens).length
          if (len < 1) {
            console.warn('Not enough listen data for now playing')
          } else {
            np_flag = true
            now_plays_2 = fromLBZToLBZ(src_np.payload.listens[0])
            now_plays_1 = trackFromLBZToFM(now_plays_2)
          }
        }
      } else {
        var recent_tracks = await src.user.getRecentTracks({
          limit: 1,
          user: cfg.SRC_NAME,
          page: 1
        })
        if (isNullOrUndefined(recent_tracks))  {
          console.warn('Null recent tracks received')
        } else {
          var len = Object.keys(recent_tracks.recenttracks.track).length
          if(len == 2) {
            tracks_1 = fromLFMToLFM(recent_tracks.recenttracks.track[1])
            tracks_2 = trackFromFMToLBZ(recent_tracks.recenttracks.track[1])
            now_plays_1 = recent_tracks.recenttracks.track[0]
            now_plays_2 = trackFromFMToLBZ(now_plays_1)
            np_flag = true
          } else if (len == 1) {
            console.warn('Null source now playing received')
            tracks_1 = fromLFMToLFM(recent_tracks.recenttracks.track[0])
            tracks_2 = trackFromFMToLBZ(recent_tracks.recenttracks.track[0])
            if (isNullOrUndefined(tracks_1))  {
              console.warn('Null source now playing received')
            }
          } else {
            console.warn("unexpected result from getRecentTracks")
          }
        }
      }
      let pl_lfm = Object.is(tracks_1,last_tr_1)
      let pl_lbz = Object.is(tracks_2,last_tr_2)
      let np_lfm = Object.is(now_plays_1,last_np_1) 
      let np_lbz = Object.is(now_plays_2,last_np_2) 
      let track_change = ! pl_lbz || ! pl_lfm
      let nowplay_change = np_flag && (! np_lbz || ! np_lfm)
      if (cfg.DEST_NAME_LASTFM) {
        if (nowplay_change) await lastfm.track.updateNowPlaying(now_plays_1)
        if (track_change) {
          var tr: any = []
          tr.push(tracks_1)
          await lastfm.track.scrobble(tr)
        }
      }
      if (cfg.DEST_NAME_LIBREFM) {
        if (nowplay_change) await librefm.track.updateNowPlaying(now_plays_1)
        if (track_change) {
          var tr: any = []
          tr.push(tracks_1)
          await librefm.track.scrobble(tr)
        } 
      }
      if (cfg.DEST_NAME_LISTENBRAINZ) {
        if (nowplay_change) {
          var tr: any = []
            tr.push(now_plays_2)
          await listenbrainz.Submit_Listens({
            listen_type: ListenType.Playing_Now,
            payload: tr
          })
        } 
        if (track_change) {
            var tr: any = []
            tr.push(tracks_2)
            await listenbrainz.Submit_Listens({
              listen_type: ListenType.Single,
              payload: tr
          })
        }
      }
      if(track_change) {
        last_tr_1 = tracks_1
        last_tr_2 = tracks_2
      }
      if(nowplay_change) {
        last_np_1 = now_plays_1
        last_np_2 = now_plays_2
      } 
    } catch(err) {
      console.error(err.message)
      console.trace(err)
    }
    cur_t = Math.round(Date.now()/1000)
    console.info("Cron job completed. Notice every " + cfg.DELAY +  " seconds:: timestamp in seconds " + Math.round((Date.now()/1000)))
    console.info("seconds between calls:: " + (cur_t - las_t))
    las_t = cur_t
  });
  task.start();
}

main()