import express from "express";
import { SongRepository } from "../database/song-repository";
import { Constants } from "../config/Constants";
import { Song } from "../models/song";

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

                    response.success = await SongRepository.updateSong(song)

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
                    if (SongRouter.currentSong.artist != SongRouter.currentSong.composer) {
                        artistComposerString = `${SongRouter.currentSong.artist} (${SongRouter.currentSong.composer})`
                    }
                    res.send(`<!DOCTYPE HTML>
<html>
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
    }
}