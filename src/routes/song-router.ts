import express from "express";
import { Constants } from "../constants";
import LogService, { LogLevel } from "../logging/log-service"
import SongService from "../song-service";

export class SongRouter {
    public router = express.Router();

    constructor() { }

    public createRoutes() {
        this.router
            .route("/song")
            .get(async function (req, res) {
                const methodName = "/song";
                SongRouter.log(LogLevel.Info, "[GET]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                const songDataJson = await SongService.getSongById(+req.query.id);
                res.send(songDataJson);
            })
            .post(async function (req, res) {
                const methodName = "/song";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                const song = req.body;
                SongRouter.log(LogLevel.Info, req.body || "body: null", methodName);

                const success = await SongService.updateOrInsertSong(song);
                SongRouter.log(LogLevel.Info, `success: ${success}`, methodName);

                res.send({ success: success });
            });

        this.router
            .route("/song/list")
            .get(async function (req, res) {
                const methodName = "/song/list";
                SongRouter.log(LogLevel.Info, "[GET]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                var songListJson: string = await SongService.getSongList();
                res.send(songListJson);
            })
            .post(async function (req, res) {
                const methodName = "/song/list";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                var success: boolean = false;

                try {
                    SongRouter.log(LogLevel.Info, `body: ${req.body}` || "body: null", methodName);
                    const jsonSongList: string = JSON.stringify(req.body);
                    success = await SongService.importSongListFromJson(jsonSongList);
                } catch {
                    SongRouter.log(LogLevel.Info, `Error importing songlist`, methodName);
                }

                res.send(JSON.stringify({ success: success }));
            });

        this.router
            .route("/song/current")
            .get(function (req, res) {
                const methodName = "/song/current";
                SongRouter.log(LogLevel.Info, "[GET]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_HTML);

                let currentSongOverlayHtml = SongService.getCurrentSongOverlay();
                res.send(currentSongOverlayHtml);
            })
            .post(function (req, res) {
                const methodName = "/song/current";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                SongRouter.log(LogLevel.Info, req.body || "body: null", methodName);
                const song = req.body;
                const success = SongService.setSongAsCurrent(song);
                res.send(JSON.stringify({ success: success }));
            })
            .delete(function (req, res) {
                const methodName = "/song/current";
                SongRouter.log(LogLevel.Info, "[DELETE]", methodName);
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                const success = SongService.clearCurrentSong();
                res.send(JSON.stringify({ success: success }));
            });

        this.router
            .route("/song/mark")
            .get(async function (req, res) {
                const methodName = "/song/mark";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);
                res.send("derp");
            })
            .post(async function (req, res) {
                const methodName = "/song/mark";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);

                const body = req.body;
                SongRouter.log(LogLevel.Info, `body: ${JSON.stringify(body)}`, methodName);

                let songId = body.songId;
                SongRouter.log(LogLevel.Info, `songId: ${songId}`, methodName);

                const responseJson = await SongService.markNonQueueSongAsPlayed(songId);

                SongRouter.log(LogLevel.Info, `responseJson: ${responseJson}`, methodName);

                res.send(responseJson);
            });

        this.router
            .route("/song/queue")
            .get(async function (req, res) {
                const methodName = "/song/queue";
                SongRouter.log(LogLevel.Info, "[GET]", methodName);
                const responseJson = await SongService.getQueue();
                res.send(responseJson);
            });

        this.router
            .route("/song/queue/add")
            .post(async function (req, res) {
                const methodName = "/song/queue/add";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);

                const body = req.body;
                SongRouter.log(LogLevel.Info, `body: ${JSON.stringify(body)}`, methodName);

                let songId = body.songId;
                SongRouter.log(LogLevel.Info, `songId: ${songId}`, methodName);

                const responseJson = SongService.addToQueue(songId);

                res.send(responseJson);
            });

        this.router
            .route("/song/queue/mark")
            .post(async function (req, res) {
                const methodName = "/song/queue/mark";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);

                const body = req.body;
                SongRouter.log(LogLevel.Info, `body: ${JSON.stringify(body)}`, methodName);

                let queueId = body.queueId;
                SongRouter.log(LogLevel.Info, `queueId: ${queueId}`, methodName);

                const responseJson = await SongService.markAsPlayed(queueId);
                res.send(responseJson);
            });

        this.router
            .route("/song/queue/remove")
            .post(async function (req, res) {
                const methodName = "/song/queue/remove";
                SongRouter.log(LogLevel.Info, "[POST]", methodName);

                const body = req.body;
                SongRouter.log(LogLevel.Info, `body: ${JSON.stringify(body)}`, methodName);

                let queueId = body.queueId;
                SongRouter.log(LogLevel.Info, `queueId: ${queueId}`, methodName);

                const responseJson = await SongService.removeFromQueue(queueId);

                res.send(responseJson);
            });
    }

    static log(level: LogLevel, message: string, methodName: string) {
        console.log(message);
        LogService.log(level, message, this.constructor.name, methodName);
    }
}