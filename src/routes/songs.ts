import express from "express";
import { SongRepository } from "../database/SongRepository";
import { FileManager } from "../file/FileManager";
import { Constants } from "../config/Constants";

export class SongsRouter {
    public router = express.Router();

    constructor() { }

    public createRoutes() {
        this.router.route("/song/list")
            .get(async function (req, res) {
                console.log("[SongsRouter] [GET] /song/list");
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
                console.log("[SongsRouter] [POST] /song/list");

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
                console.log("[SongsRouter]:/song/data");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );
                const songDataJson = await SongRepository.getSongData(+req.query.id);
                res.send(songDataJson);
            })
            .post(async function (req, res) {
                console.log("[SongsRouter] [POST] /song/data");

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
    }
}