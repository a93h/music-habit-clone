'use-strict';

import fetch from 'node-fetch' // TODO: switch to 'got' library
import * as querystring from 'querystring'
import { isNullOrUndefined } from 'util';

// https://listenbrainz.readthedocs.io/en/production/dev/api/

const TAG = "ListenBrainzAPI:: "
const default_base_url = "https://api.listenbrainz.org"

enum ApiParameters {
    MAX_LISTEN_SIZE = 10240, // in bytes
    MAX_ITEMS_PER_GET = 100,
    DEFAULT_ITEMS_PER_GET = 25,
    MAX_TAGS_PER_LISTEN = 50,
    MAX_TAG_SIZE = 64
}

enum UrlSubstitutionStrings {
    User_List = "(user_list)",
    User_Name = "(user_name)"
}

enum UrlPaths {
    Validate_Token_Get = "/1/validate-token",
    User_List_Recent_Listens_Get = "/1/users/(user_list)/recent-listens",
    Submit_Listens_Post = "/1/submit-listens",
    Latest_Import_Post = "/1/latest-import",
    Latest_Import_Get = "/1/latest-import",
    User_Name_List_Count_Get = "/1/user/(user_name)/listen-count",
    User_Name_Now_Playing_Get = "/1/user/(user_name)/playing-now",
    User_Name_Listens_Get = "/1/user/(user_name)/listens",
    User_Name_Listening_Activity_Get = "/1/stats/user/(user_name)/listening-activity",
    User_Name_Daily_Activity_Get = "/1/stats/user/(user_name)/daily-activity",
    User_Name_Recordings_Get = "/1/stats/user/(user_name)/recordings",
    User_Name_Releases_Get = "/1/stats/user/(user_name)/releases",
    User_Name_Artists_Get = "/1/stats/user/(user_name)/artists",
    Get_Dump_Info = "/1/status/get-dump-info"
}

enum ListenInterval {
    Week = 'week',
    Month = 'month',
    Year = 'year',
    All_Time = 'all_time' // default
}

enum ListenType {
    Single = 'single',
    Import = 'import',
    Playing_Now = 'playing_now'
}

interface Submit_Listen {
    listened_at: number,
    track_metadata: {
        additional_info: {
            listening_from: string,
            release_mbid: string,
            artist_mbids: string[],
            work_mbids: string[]
            release_group_mbid: string,
            recording_mbid: string,
            track_mbid: string,
            tags: string[],
            spotify_id: string,
            isrc: string,
            tracknumber: number
        },
        artist_name: string,
        track_name: string,
        release_name: string
    }
}

interface Listen {
    inserted_at: string,
    listened_at: number,
    recording_msid: string,
    track_metadata: {
        additional_info: {
            listening_from: string,
            release_mbid: string,
            artist_mbids: string[],
            recording_mbid: string,
            tags: string[],
            artist_msid: string,
            origin_url: string,
            recording_msid: string,
            release_msid: string,
            work_mbids: string[]
            release_group_mbid: string,
            track_mbid: string,
            spotify_id: string,
            isrc: string,
            tracknumber: number
        },
        artist_name: string,
        track_name: string,
        release_name: string
    },
    user_name: string
}

interface Listening_Activity {
    from_ts: number,
    listen_count: number,
    time_range: string,
    to_ts: number
}

interface Hour_Activity { 
    hour: number,
    listen_count: number
}

interface Recordings {
    artist_mbids: string[],
    artist_msid: string,
    artist_name: string,
    listen_count: number,
    recording_mbid: string,
    recording_msid: string,
    release_mbid: string,
    release_msid: string,
    release_name: string,
    track_name: string
}

interface Releases {
    artist_mbids: string[],
    artist_msid: string,
    artist_name: string,
    listen_count: number,
    release_mbid: string,
    release_msid: string,
    release_name: string
}

interface Artists {
    artist_mbids: string[],
    artist_msid: string,
    artist_name: string,
    listen_count: number
}

interface Submit_Listen_Payload {
    listen_type: string,
    payload: Submit_Listen[]
}

interface Submit_Listen_Response {
    status: string
}

interface Validate_Token_Payload {
    code: number,
    message: string,
    valid: boolean,
    user: string
}

interface Recent_Listens_Payload {
    payload: {
        count: number,
        listens: Listen[]
        user_list: string
    }
}

interface Now_Playing_Payload {
    payload: {
        count: number
        listens: Listen[],
        playing_now: boolean,
        user_id: string
    }
}

interface Listens_Payload {
    payload: {
        count: number
        latest_listen_ts: number,
        listens: Listen[],
        user_id: string
    }
}

interface Latest_Import_Payload {
    musicbrainz_id: string,
    latest_import: number
}

interface Latest_Import_Payload_Post {
    status: string
}

interface Listening_Activity_Payload {
    payload : {
        from_ts: number,
        last_updated: number,
        listening_activity: Listening_Activity[],
        to_ts: number, 
        user_id: string
    }    
}

interface Daily_Activity_Payload {
    payload : {
        from_ts: number,
        last_updated: number,
        daily_activity: {
            Monday: Hour_Activity[],
            Teusday: Hour_Activity[],
            Wednesday: Hour_Activity[],
            Thursday: Hour_Activity[],
            Friday: Hour_Activity[],
            Saturday: Hour_Activity[],
            Sunday: Hour_Activity[]
        },        
        to_ts: number, 
        user_id: string
    }   
}

interface Recordings_Paylaod {
    payload : {
        recordings : Recordings[],
        count: number,
        total_recording_count: number,
        range: string,
        last_updated: number,
        user_id: string,
        from_ts: number,
        to_ts: number   
    }
}

interface Releases_Paylaod {
    payload : {
        releases : Releases[],
        count: number,
        total_release_count: number,
        range: string,
        last_updated: number,
        user_id: string,
        from_ts: number,
        to_ts: number   
    }
}

interface Artists_Paylaod {
    payload : {
        artists : Artists[],
        count: number,
        total_artist_count: number,
        range: string,
        last_updated: number,
        user_id: string,
        from_ts: number,
        to_ts: number   
    }
}

interface Get_Dump_Info_Data {
    id: number,
    timestamp: string
}

interface Session {
    token: string,
    api_key: string,
    secret: string,
    url: string
}

interface UriParam {
    path: string,
    params: any,
    place_holder: string,
    substitute: any
}

class ListenBrainzAPI {
    static ApiParameters = ApiParameters
    static UrlSubstitutionStrings = UrlSubstitutionStrings
    static UrlPaths = UrlPaths
    static ListenType = ListenType

    h: any
    s: Session
    constructor(s: Session) {
        this.s = s
        if (s.url) this.s.url = s.url
        else this.s.url = default_base_url
        if (!s.api_key) console.warn(TAG + "no api_key")
        if (!s.secret) console.warn(TAG + "no secret")
        if (!s.token) throw Error(TAG + "no token")
        this.h = { 'Authorization': 'Token ' + this.s.token }
    }

    private buildRequestUrl(r: UriParam){
        var uri: string
        if(isNullOrUndefined(r.params)) uri = this.s.url + r.path
        else uri = this.s.url + r.path + "?" + querystring.stringify(r.params)
        if(!isNullOrUndefined(r.substitute)) uri = uri.replace(r.place_holder, r.substitute)
        return uri
    }

    public async Submit_Listens(submit_listens: Submit_Listen_Payload): Promise<Submit_Listen_Response> {
        const uri = this.buildRequestUrl({
            path: UrlPaths.Submit_Listens_Post,
            params: null,
            substitute: null,
            place_holder: null
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'post',
            body: JSON.stringify(submit_listens)
        });
        let json = await resp.json() 
        if (!resp.ok) throw Error(TAG + JSON.stringify(json))
        json = json as Submit_Listen_Response
        if (!json) throw Error(TAG + "invalid submission")
        return json
    }
    
    public async Validate_Token(): Promise<Validate_Token_Payload> {
        const params = {token: this.s.token}
        const uri = this.buildRequestUrl({
            path: UrlPaths.Validate_Token_Get,
            params: params,
            substitute: null,
            place_holder: null,
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) throw Error(TAG + JSON.stringify(json))
        json = json as Validate_Token_Payload
        if (!json.user_name) throw Error(TAG + "invalid token")
        return json
     }

     public async Recent_Listens(users: string[]): Promise<Recent_Listens_Payload> {
        var user_list = ""
        var i = 0;
        for(i; i<users.length-1; i++){
            user_list += escape(users[i]) + ","
        }
        ++i;
        user_list += escape(users[i])
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_List_Recent_Listens_Get,
            params: null,
            place_holder: UrlSubstitutionStrings.User_List,
            substitute: user_list
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json()
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Recent_Listens_Payload
        if (!json.payload) 
        console.warn(TAG + "invalid Recent Listens payload")
        return json
     }

     public async Playing_Now(user: string): Promise<Now_Playing_Payload> {
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Now_Playing_Get,
            params: null,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Now_Playing_Payload
        if (!json.payload) 
           console.warn(TAG + "invalid Now Playing payload")
        return json
     }

     public async Listens(user_name: string,  count: number = ApiParameters.DEFAULT_ITEMS_PER_GET,
                            min_ts: number = -1, max_ts: number = -1): Promise<Listens_Payload> {
        var params = {}
        if (count > ApiParameters.MAX_ITEMS_PER_GET)
            console.warn(TAG + "more than 100 max listesns requested")
        if (min_ts > 0) params['min_ts'] = min_ts
        if (max_ts > 0) params['max_ts'] = max_ts
        params['count'] = count
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Listens_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Listens_Payload
        if (!json.payload) 
           console.warn(TAG + "invalid Listens payload")
        return json
     }

     public async Latest_Import(user_name: string): Promise<Latest_Import_Payload> {
        const params = {
            user_name: user_name
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.Latest_Import_Get,
            params: params,
            place_holder: null,
            substitute: null
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Latest_Import_Payload
        if (!json.musicbrainz_id) 
           console.warn(TAG + "invalid Latest Import data")
        return json
     }

     public async Latest_Import_Post(ts: number): Promise<Latest_Import_Payload_Post> {
        const params = {
            ts: ts
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.Latest_Import_Post,
            params: null,
            place_holder: null,
            substitute: null
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'post',
            body: JSON.stringify(params)
        });
        let json = await resp.json() 
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Latest_Import_Payload_Post
        if (!json.status) 
           console.warn(TAG + "invalid Latest Import Post")
        return json
     }
     
     public async Listening_Activity(user_name: string, range: string = ListenInterval.All_Time): Promise<Listening_Activity_Payload> {
        const params = {
            range: range
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Listening_Activity_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
           console.warn(TAG + JSON.stringify(json))
           return null
        }
        json = json as Listening_Activity_Payload
        if (!json.payload) 
           console.warn(TAG + "invalid Listening Activity payload")
        return json
     }

     public async Daily_Activity(user_name: string, range: string = ListenInterval.All_Time): Promise<Daily_Activity_Payload> {
        const params = {
            range: range
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Daily_Activity_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
           console.warn(TAG + JSON.stringify(json))
           return null
        }
        json = json as Daily_Activity_Payload
        if (!json.payload) 
           console.warn(TAG + "invalid Daily Activity payload")
        return json
     }

     public async Recordings(user_name: string, count: number = ApiParameters.DEFAULT_ITEMS_PER_GET, offset: number = 0,
                                range: string = 'all_time' ): Promise<Recordings_Paylaod> {
        const params = {
            count: count,
            offset: offset,
            range: range
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Recordings_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
           console.warn(TAG + JSON.stringify(json))
           return null
        }
        json = json as Recordings_Paylaod
        if (!json.payload) 
           console.warn(TAG + "invalid Recordings payload")
        return json
     }

     public async Releases(user_name: string, count: number = ApiParameters.DEFAULT_ITEMS_PER_GET, offset: number = 0,
                                range: string = 'all_time' ): Promise<Releases_Paylaod> {
        const params = {
            count: count,
            offset: offset,
            range: range
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Releases_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
           console.warn(TAG + JSON.stringify(json))
           return null
        }
        json = json as Releases_Paylaod
        if (!json.payload) 
           console.warn(TAG + "invalid Recordings payload")
        return json
     }
     
     public async Artists(user_name: string, count: number = ApiParameters.DEFAULT_ITEMS_PER_GET, offset: number = 0,
                                range: string = 'all_time' ): Promise<Artists_Paylaod> {
        const params = {
            count: count,
            offset: offset,
            range: range
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.User_Name_Artists_Get,
            params: params,
            place_holder: UrlSubstitutionStrings.User_Name,
            substitute: user_name
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
           console.warn(TAG + JSON.stringify(json))
           return null
        }
        json = json as Artists_Paylaod
        if (!json.payload) 
           console.warn(TAG + "invalid Artists payload")
        return json
     }

     public async Get_Dump_Info(id: number = 1): Promise<Get_Dump_Info_Data> {
        const params = {
            id: id
        }
        const uri = this.buildRequestUrl({
            path: UrlPaths.Latest_Import_Get,
            params: params,
            place_holder: null,
            substitute: null
        })
        const resp = await fetch(uri,{
            headers: this.h,
            method: 'get',
        });
        let json = await resp.json() 
        if (!resp.ok) {
            console.warn(TAG + JSON.stringify(json))
            return null
        }
        json = json as Latest_Import_Payload
        if (!json.musicbrainz_id) 
           console.warn(TAG + "invalid Latest Import data")
        return json
     }
}
// common
export { ListenBrainzAPI, Session, Listen, ListenType }
// others
export { Now_Playing_Payload, Listens_Payload, Submit_Listen_Payload }