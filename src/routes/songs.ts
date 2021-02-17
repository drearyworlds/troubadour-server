import express from "express";
import fs from "fs";
import { Configuration } from "../config"

const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
const HTTP_HEADER_CONTENT_TYPE_JSON = "application/json";
const HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";
const ENCODING_UTF8 = "utf8";

const config = new Configuration();
const SONGS_PATH = `${config.getDataPath()}songs/`;
const SONGLIST_JSON = `${config.getDataPath()}songList.json`;
const CURRENTSONG_TXT = `${config.getDataPath()}currentsong.txt`;

export const SongsRouter = express.Router()

SongsRouter.get("/songlist", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
    const songListJson = fs.readFileSync(SONGLIST_JSON, ENCODING_UTF8);
    res.send(songListJson);
});

SongsRouter.get("/songdata", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
    const songListJson = fs.readFileSync(SONGLIST_JSON, ENCODING_UTF8);
    const songList = JSON.parse(songListJson);
    const songData = songList["songs"].find(
        (song: any) => (song.title = req.query.title && song.artist == req.query.artist)
    );
    res.send(JSON.stringify(songData));
});

SongsRouter.get("/songlyrics", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);

    console.log(req.query.artist || "reg.query.artist: null");
    console.log(req.query.title || "req.query.title: null");

    if (req && req.query && req.query.artist && req.query.title) {
        let sanitizedArtist: string = req.query.artist.toString().replace(/:|;|"/g, "_");
        let sanitizedTitle: string = req.query.title.toString().replace(/:|;|"/g, "_");

        console.log(sanitizedArtist || "sanitizedArtist: null");
        console.log(sanitizedTitle || "sanitizedTitle: null");

        const songLyricsFileName = `${SONGS_PATH}${sanitizedArtist} - ${sanitizedTitle}${config.getLyricsExtension()}`;
        console.log(songLyricsFileName || "songLyricsFileName: null");

        if (songLyricsFileName == null || !fs.existsSync(songLyricsFileName)) {
            res.send(`Failed to retrieve song lyrics for ${songLyricsFileName}`);
            return;
        }

        const songLyrics = fs.readFileSync(songLyricsFileName, ENCODING_UTF8);
        res.send(songLyrics);
    }
});

SongsRouter.post("/currentsong/clear", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);
    try {
        fs.writeFileSync(CURRENTSONG_TXT, "", ENCODING_UTF8);
        res.send(true);
    } catch {
        res.send(`Error clearing current song`);
    }
});

SongsRouter.post("/currentsong/update", (req, res) => {
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
        currentSongText = `${song["artist"]}\n${song["title"]}\n${song["album"]} (${song["year"]})`;

        fs.writeFileSync(CURRENTSONG_TXT, currentSongText, ENCODING_UTF8);
        console.log(`Current song updated to:\n${currentSongText}`);
        response.success = true;
        res.send(JSON.stringify(response));
    } catch {
        console.log(`Error occurred updating current song to:\n${currentSongText}`);
        res.send(JSON.stringify(response));
    }
});