import express from "express";
import { SongRepository } from "../database/song-repository";
import { Constants } from "../constants";
import Configuration from "../config/configuration-service";
import { Song } from "../models/song";
import fetch from "node-fetch"
import LogService from "../logging/log-service"

export class SongRouter {
    public router = express.Router();

    // Static variable holding current song in memory. Not persistent
    private static currentSong: Song;

    constructor() { }

    public createRoutes() {
        this.router.route("/song/list")
            .get(async function (req, res) {
                LogService.log("[SongRouter] [GET] /song/list");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let songsArray = [];
                songsArray = await SongRepository.getSongList();

                const songList = {
                    songs: songsArray
                };

                LogService.log(`Retrieved songList from db [${songList.songs.length} entries]`)

                const songListJson = JSON.stringify(songList);
                res.send(songListJson);
            })
            .post(async function (req, res) {
                LogService.log("[SongRouter] [POST] /song/list");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let response = {
                    success: false
                };

                try {
                    LogService.log(`body: ${req.body}` || "body: null");
                    const jsonSongList: string = JSON.stringify(req.body);

                    //LogService.log(`jsonSongList: ${jsonSongList}`)

                    response.success = await SongRepository.importSongListFromJson(jsonSongList);

                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(`Error importing songlist`);
                    res.send(JSON.stringify(response));
                }
            });

        this.router.route("/song/data")
            .get(async function (req, res) {
                LogService.log("[SongRouter]:/song/data");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );
                const songDataJson = await SongRepository.getSongData(+req.query.id);
                res.send(songDataJson);
            })
            .post(async function (req, res) {
                LogService.log("[SongRouter] [POST] /song/data");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let response = {
                    success: false
                };

                try {
                    LogService.log(req.body || "body: null");
                    const song = req.body;

                    response.success = await SongRepository.updateOrInsertSong(song)

                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(`Error occurred getting song data`);
                    res.send(JSON.stringify(response));
                }
            })

        this.router
            .route("/song/current")
            .get(function (req, res) {
                LogService.log("[SongRouter] [GET] /song/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_HTML
                );

                if (SongRouter.currentSong) {
                    let artistComposerString = SongRouter.currentSong.artist;
                    if (SongRouter.currentSong.composer
                        && SongRouter.currentSong.composer != undefined
                        && SongRouter.currentSong.composer != null
                        && SongRouter.currentSong.composer != ""
                        && SongRouter.currentSong.artist != SongRouter.currentSong.composer) {
                        artistComposerString = `${SongRouter.currentSong.artist} (${SongRouter.currentSong.composer})`
                    }
                    res.send(`<!DOCTYPE HTML>
<html>
    <meta http-equiv="refresh" content="8">
    <body>
        <div>
            <span="artistAndComposer">${artistComposerString}</span>
        </div>
        <div>
            <span="title">"${SongRouter.currentSong.title}"</span>
        </div>
        <div>
            <span="albumAndYear">${SongRouter.currentSong.album} (${SongRouter.currentSong.year})</span>
        </div>
        <div>
            <span="suggestedBy">${SongRouter.currentSong.suggestedBy ? "Suggested by " + SongRouter.currentSong.suggestedBy : ""}</span>
        </div>
    </body>
</html>
                `);
                } else {
                    res.send(`<!DOCTYPE HTML>
<html>
    <meta http-equiv="refresh" content="1">
    <body>
    </body>
</html>
                `);

                }
            })
            .post(function (req, res) {
                LogService.log("[SongRouter] [POST] /song/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentSongText = ``;
                let response = {
                    success: false
                };

                try {
                    LogService.log(req.body || "body: null");
                    const song = req.body;
                    SongRouter.currentSong = song;
                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                LogService.log("[SongRouter] [DELETE] /song/current");
            });

        this.router
            .route("/ss/list")
            .get(async function (req, res) {
                LogService.log("[SongRouter] [GET] /ss/list");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                let urlString = Constants.URL_SS_SONGS;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                let params: URLSearchParams = new URLSearchParams()
                params.append('current', "0")
                params.append('size', "0")
                params.append('showInactive', "true")
                params.append('isNew', "false")
                params.append('order', "asc")

                url.search = params.toString();
                LogService.log(`url.search: ${url.search}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server",
                        "x-ssl-user-types": "streamer"
                    }
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                LogService.log(`Retrieved songList from SS`)

                res.send(responseJson);
            })

        this.router
            .route("/ss/song")
            .put(async function (req, res) {
                LogService.log("[SongRouter] [PUT] /ss/song");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                let songId = req.body.id;
                const body = req.body
                const bodyString = JSON.stringify(body)
                LogService.log(`bodyString: ${bodyString}`);


                LogService.log(`songId: ${songId}`);

                let urlString = Constants.URL_SS_SONGS_UPDATE;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
                urlString = urlString.replace(/{songId}/g, songId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    },
                    body: bodyString
                })
                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                LogService.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })
            .post(async function (req, res) {
                LogService.log("[SongRouter] [POST] /ss/song");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                let songId = req.body.id;
                const body = req.body
                const bodyString = JSON.stringify(body)
                LogService.log(`bodyString: ${bodyString}`);

                let urlString = Constants.URL_SS_SONGS;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    },
                    body: bodyString
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                LogService.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            });

        this.router
            .route("/ss/queue")
            .get(async function (req, res) {
                LogService.log("[SongRouter] [GET] /ss/queue");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                let urlString = Constants.URL_SS_QUEUE;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const response = await fetch(url, {
                    method: 'GET'
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                //LogService.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })

        this.router
            .route("/ss/queue/add")
            .post(async function (req, res) {
                LogService.log("[SongRouter] [GET] /ss/queue/add");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                const body = req.body;
                LogService.log(`body: ${JSON.stringify(body)}`);

                let songId = body.songId;
                LogService.log(`songId: ${songId}`);

                let urlString = Constants.URL_SS_QUEUE_REQUEST;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
                urlString = urlString.replace(/{songId}/g, songId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                //LogService.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })

        this.router
            .route("/ss/queue/mark")
            .post(async function (req, res) {
                LogService.log("[SongRouter] [GET] /ss/queue/mark");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                const body = req.body;
                LogService.log(`body: ${JSON.stringify(body)}`);

                let queueId = body.queueId;
                LogService.log(`queueId: ${queueId}`);

                let urlString = Constants.URL_SS_QUEUE_PLAYED;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
                urlString = urlString.replace(/{queueId}/g, queueId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                LogService.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);

            })


        this.router
            .route("/ss/queue/remove")
            .post(async function (req, res) {
                LogService.log("[SongRouter] [GET] /ss/queue/remove");

                const streamerId = Configuration.getStreamerId()
                LogService.log(`streamerId: ${streamerId}`);

                const body = req.body;
                LogService.log(`body: ${JSON.stringify(body)}`);

                let queueId = body.queueId;
                LogService.log(`queueId: ${queueId}`);

                let urlString = Constants.URL_SS_QUEUE_REMOVE;
                urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
                urlString = urlString.replace(/{queueId}/g, queueId.toString());

                const url: URL = new URL(urlString);
                LogService.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });

                LogService.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                res.send(responseJson);
            })
    }
}