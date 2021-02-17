import express from "express";
import Configuration from "../config";
import { SongRepository } from "../database/SongRepository";

const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
const HTTP_HEADER_CONTENT_TYPE_JSON = "application/json";
const HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";
const ENCODING_UTF8 = "utf8";

const SONGS_PATH = `${Configuration.getDataPath()}songs/`;
const SONGLIST_JSON = `${Configuration.getDataPath()}songList.json`;
const CURRENTSONG_TXT = `${Configuration.getDataPath()}currentsong.txt`;

export class SongsRouter {
    public router = express.Router();

    constructor() {}

    public createRoutes() {
        // New API
        this.router.route("/song/list").get(function (req, res) {
            console.log("Songthis.router.getSongList (new)");
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
            const songListJson = new SongRepository().getSongList(SONGLIST_JSON, ENCODING_UTF8);
            res.send(songListJson);
        });

        this.router.route("/song/data").get(function (req, res) {
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
            const songDataJson = new SongRepository().getSongData(
                SONGLIST_JSON,
                ENCODING_UTF8,
                req.query.artist.toString(),
                req.query.title.toString()
            );
            res.send(songDataJson);
        });

        this.router.route("/song/lyrics").get(function (req, res) {
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);

            if (req && req.query && req.query.artist && req.query.title) {
                const artist = req.query.artist.toString();
                const songLyrics = new SongRepository().getSongLyrics(
                    SONGS_PATH,
                    Configuration.getLyricsExtension(),
                    ENCODING_UTF8,
                    req.query.artist.toString(),
                    req.query.title.toString()
                );
                if (songLyrics) {
                    res.send(songLyrics);
                } else {
                    res.send("Unable to obtain song lyrics");
                }
            }
        });

        this.router
            .route("/song/current")
            .get(function (req, res) {
                res.send("Get the current song");
            })
            .post(function (req, res) {
                console.log("/currentsong/update");
                res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);

                let currentSongText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(req.body || "body: null");
                    const song = req.body;

                    // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)

                    response.success = new SongRepository().setCurrentSong(
                        CURRENTSONG_TXT,
                        ENCODING_UTF8,
                        song
                    );

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                res.send("Clear the current song");
            });

        // Legacy API

        this.router.get("/songlist", (req, res) => {
            console.log(`[${this.constructor.name}::${Object.getOwnPropertyNames(SongsRouter.prototype)} (old)] [Start]`);
            

            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
            const songListJson = new SongRepository().getSongList(SONGLIST_JSON, ENCODING_UTF8);
            //console.log(`songListJson: ${songListJson}`);
            res.send(songListJson);
        });

        this.router.get("/songdata", (req, res) => {
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
            const songDataJson = new SongRepository().getSongData(
                SONGLIST_JSON,
                ENCODING_UTF8,
                req.query.artist.toString(),
                req.query.title.toString()
            );
            res.send(songDataJson);
        });

        this.router.get("/songlyrics", (req, res) => {
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);

            if (req && req.query && req.query.artist && req.query.title) {
                const artist = req.query.artist.toString();
                const songLyrics = new SongRepository().getSongLyrics(
                    SONGS_PATH,
                    Configuration.getLyricsExtension(),
                    ENCODING_UTF8,
                    req.query.artist.toString(),
                    req.query.title.toString()
                );
                if (songLyrics) {
                    res.send(songLyrics);
                } else {
                    res.send("Unable to obtain song lyrics");
                }
            }
        });

        this.router.post("/currentsong/clear", (req, res) => {
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);
            try {
                new SongRepository().clearCurrentSong(CURRENTSONG_TXT, ENCODING_UTF8);
                res.send(true);
            } catch {
                res.send(`Error clearing current song`);
            }
        });

        this.router.post("/currentsong/update", (req, res) => {
            console.log("/currentsong/update");
            res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);

            let currentSongText = ``;
            let response = {
                success: false
            };

            try {
                console.log(req.body || "body: null");
                const song = req.body;

                // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)

                response.success = new SongRepository().setCurrentSong(
                    CURRENTSONG_TXT,
                    ENCODING_UTF8,
                    song
                );

                res.send(JSON.stringify(response));
            } catch {
                console.log(`Error occurred updating current song to:\n${currentSongText}`);
                res.send(JSON.stringify(response));
            }
        });
    }
}