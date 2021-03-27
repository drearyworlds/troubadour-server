import express from "express";
import { SongRepository } from "../database/song-repository";
import { Constants } from "../config/Constants";
import Configuration from "../config/Configuration";
import { Song } from "../models/song";
import fetch from "node-fetch"
import https from "https"

export class SongRouter {
    public router = express.Router();

    // Static variable holding current song in memory. Not persistent
    private static currentSong: Song;

    constructor() { }

    public createRoutes() {
        this.router.route("/song/list")
            .get(async function (req, res) {
                console.log("[SongRouter] [GET] /song/list");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let songsArray = [];
                songsArray = await SongRepository.getSongList();

                const songList = {
                    songs: songsArray
                };

                console.log(`Retrieved songList from db [${songList.songs.length} entries]`)

                const songListJson = JSON.stringify(songList);
                res.send(songListJson);
            })
            .post(async function (req, res) {
                console.log("[SongRouter] [POST] /song/list");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentSongText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(`body: ${req.body}` || "body: null");
                    const jsonSongList: string = JSON.stringify(req.body);

                    console.log(`jsonSongList: ${jsonSongList}`)

                    response.success = await SongRepository.importSongListFromJson(jsonSongList);

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            });

        this.router.route("/song/data")
            .get(async function (req, res) {
                console.log("[SongRouter]:/song/data");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );
                const songDataJson = await SongRepository.getSongData(+req.query.id);
                res.send(songDataJson);
            })
            .post(async function (req, res) {
                console.log("[SongRouter] [POST] /song/data");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentSongText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(req.body || "body: null");
                    const song = req.body;

                    response.success = await SongRepository.updateOrInsertSong(song)

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            })

        this.router
            .route("/song/current")
            .get(function (req, res) {
                console.log("[SongRouter] [GET] /song/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_HTML
                );

                if (SongRouter.currentSong) {
                    let artistComposerString = SongRouter.currentSong.artist;
                    if (SongRouter.currentSong.composer != undefined
                        && SongRouter.currentSong.artist != SongRouter.currentSong.composer) {
                        artistComposerString = `${SongRouter.currentSong.artist} (${SongRouter.currentSong.composer})`
                    }
                    res.send(`<!DOCTYPE HTML>
<html>
    <meta http-equiv="refresh" content="3">
    <body>
        <div class="label">Current song:</div>
        <div class="data">${artistComposerString}</div>
        <div class="data">"${SongRouter.currentSong.title}"</div>
        <div class="data">${SongRouter.currentSong.album} (${SongRouter.currentSong.year})</div>
    </body>
</html>
                `);
                } else {
                    res.send(`<!DOCTYPE HTML>
<html>
    <meta http-equiv="refresh" content="3">
    <body>
        <div class="label">Current song:</div>
        <div class="data">[None]</div>
    </body>
</html>
                `);

                }
            })
            .post(function (req, res) {
                console.log("[SongRouter] [POST] /song/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentSongText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(req.body || "body: null");
                    const song = req.body;
                    SongRouter.currentSong = song;
                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                console.log("[SongRouter] [DELETE] /song/current");
            });

        this.router
            .route("/ss/list")
            .get(async function (req, res) {
                console.log("[SongRouter] [GET] /ss/list");

                const streamerId = Configuration.getStreamerId()
                console.log(`streamerId: ${streamerId}`);

                let urlString = Constants.URL_SS_GET_LIST;
                urlString = urlString.replace(/{streamerId}/g, streamerId);

                const url: URL = new URL(urlString);
                console.log(`url: ${url.toString()}`);

                let params: URLSearchParams = new URLSearchParams()
                params.append('size', "0")
                params.append('current', "0")
                params.append('showInactive', "false")
                params.append('isNew', "false")
                params.append('order', "asc")

                url.search = new URLSearchParams(params).toString();
                console.log(`url.search: ${url.search}`);

                const response = await fetch(url, {
                    method: 'GET'
                });

                console.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                console.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })

        this.router
            .route("/ss/queue")
            .get(async function (req, res) {
                console.log("[SongRouter] [GET] /ss/queue");

                const streamerId = Configuration.getStreamerId()
                console.log(`streamerId: ${streamerId}`);

                let urlString = Constants.URL_SS_GET_QUEUE;
                urlString = urlString.replace(/{streamerId}/g, streamerId);

                const url: URL = new URL(urlString);
                console.log(`url: ${url.toString()}`);

                const response = await fetch(url, {
                    method: 'GET'
                });

                console.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                console.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })

        this.router
            .route("/ss/queue/add")
            .post(async function (req, res) {
                console.log("[SongRouter] [GET] /ss/queue/add");

                const streamerId = Configuration.getStreamerId()
                console.log(`streamerId: ${streamerId}`);

                const body = req.body;
                console.log(`body: ${JSON.stringify(body)}`);

                let songId = body.songId;
                console.log(`songId: ${songId}`);

                let urlString = Constants.URL_SS_QUEUE_ADD;
                urlString = urlString.replace(/{streamerId}/g, streamerId);
                urlString = urlString.replace(/{songId}/g, songId.toString());

                const url: URL = new URL(urlString);
                console.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });
                
                console.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                console.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })

            this.router
            .route("/ss/queue/mark")
            .post(async function (req, res) {
                console.log("[SongRouter] [GET] /ss/queue/mark");

                const streamerId = Configuration.getStreamerId()
                console.log(`streamerId: ${streamerId}`);

                const body = req.body;
                console.log(`body: ${JSON.stringify(body)}`);

                let queueId = body.queueId;
                console.log(`queueId: ${queueId}`);

                let urlString = Constants.URL_SS_QUEUE_MARK;
                urlString = urlString.replace(/{streamerId}/g, streamerId);
                urlString = urlString.replace(/{queueId}/g, queueId.toString());

                const url: URL = new URL(urlString);
                console.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });
                
                console.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                console.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);

            })
 

        this.router
            .route("/ss/queue/remove")
            .post(async function (req, res) {
                console.log("[SongRouter] [GET] /ss/queue/remove");

                const streamerId = Configuration.getStreamerId()
                console.log(`streamerId: ${streamerId}`);

                const body = req.body;
                console.log(`body: ${JSON.stringify(body)}`);

                let queueId = body.queueId;
                console.log(`queueId: ${queueId}`);

                let urlString = Constants.URL_SS_QUEUE_REMOVE;
                urlString = urlString.replace(/{streamerId}/g, streamerId);
                urlString = urlString.replace(/{queueId}/g, queueId.toString());

                const url: URL = new URL(urlString);
                console.log(`url: ${url.toString()}`);

                const token = Configuration.getStreamerSonglistToken()

                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': "troubadour-server"
                    }
                });
                
                console.log(`response.ok: ${response.ok}`);

                const responseJson = await response.json();

                console.log(`responseJson: ${JSON.stringify(responseJson)}`);

                res.send(responseJson);
            })
   }
}