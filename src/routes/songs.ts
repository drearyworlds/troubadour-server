import express from "express";
import Configuration from "../config/Configuration";
import { SongRepository } from "../database/SongRepository";
import { FileManager } from "../file/FileManager";
import { Constants } from "../config/Constants";

export class SongsRouter {
    public router = express.Router();

    constructor() {}

    public createRoutes() {
        // New API
        this.router.route("/song/list").get(async function (req, res) {
            console.log("[SongsRouter]:/song/list");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_JSON
            );

            let songsArray = [];
            songsArray = await SongRepository.getSongList();

            const songList = {
                songs: songsArray
            };

            console.log("songlist")
            console.log(songList)

            const songListJson = JSON.stringify(songList);
            res.send(songListJson);
        });

        this.router.route("/song/data").get(function (req, res) {
            console.log("[SongsRouter]:/song/data");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_JSON
            );
            const songDataJson = FileManager.getSongData(
                Constants.SONGLIST_JSON,
                Constants.ENCODING_UTF8,
                req.query.artist.toString(),
                req.query.title.toString()
            );
            res.send(songDataJson);
        });

        this.router.route("/song/lyrics").get(function (req, res) {
            console.log("[SongsRouter]:/song/lyrics");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_TEXT
            );

            if (req && req.query && req.query.artist && req.query.title) {
                const artist = req.query.artist.toString();
                const songLyrics = FileManager.getSongLyrics(
                    Constants.SONGS_PATH,
                    Configuration.getLyricsExtension(),
                    Constants.ENCODING_UTF8,
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
                console.log("[SongsRouter] [GET] /song/current");
                res.send("Get the current song");
            })
            .post(function (req, res) {
                console.log("[SongsRouter] [POST] /song/current");

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

                    // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)

                    response.success = FileManager.setCurrentSong(
                        Constants.CURRENTSONG_TXT,
                        Constants.ENCODING_UTF8,
                        song
                    );

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current song to:\n${currentSongText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                console.log("[SongsRouter] [DELETE] /song/current");
            });

        // Legacy API

        this.router.get("/songlist", (req, res) => {
            console.log("[SongsRouter] [GET] /songlist");
            console.log(
                `[${this.constructor.name}::${Object.getOwnPropertyNames(
                    SongsRouter.prototype
                )} (old)] [Start]`
            );

            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_JSON
            );
            const songListJson = FileManager.getSongList(
                Constants.SONGLIST_JSON,
                Constants.ENCODING_UTF8
            );

            res.send(songListJson);
        });

        this.router.get("/songdata", (req, res) => {
            console.log("[SongsRouter] [GET] /songdata");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_JSON
            );
            const songDataJson = FileManager.getSongData(
                Constants.SONGLIST_JSON,
                Constants.ENCODING_UTF8,
                req.query.artist.toString(),
                req.query.title.toString()
            );
            res.send(songDataJson);
        });

        this.router.get("/songlyrics", (req, res) => {
            console.log("[SongsRouter] [GET] /song/lyrics");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_TEXT
            );

            if (req && req.query && req.query.artist && req.query.title) {
                const artist = req.query.artist.toString();
                const songLyrics = FileManager.getSongLyrics(
                    Constants.SONGS_PATH,
                    Configuration.getLyricsExtension(),
                    Constants.ENCODING_UTF8,
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
            console.log("[SongsRouter] [POST] /currentsong/clear");
            res.setHeader(
                Constants.HTTP_HEADER_CONTENT_TYPE,
                Constants.HTTP_HEADER_CONTENT_TYPE_TEXT
            );
            try {
                FileManager.clearCurrentSong(Constants.CURRENTSONG_TXT, Constants.ENCODING_UTF8);
                res.send(true);
            } catch {
                res.send(`Error clearing current song`);
            }
        });

        this.router.post("/currentsong/update", (req, res) => {
            console.log("[SongsRouter] [POST] /currentsong/update");
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

                // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)

                response.success = FileManager.setCurrentSong(
                    Constants.CURRENTSONG_TXT,
                    Constants.ENCODING_UTF8,
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