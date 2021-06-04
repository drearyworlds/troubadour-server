import express from "express";
import bodyParser from "body-parser";
import { SongRouter } from "./routes/song-router";
import { DrinkRouter } from "./routes/drink-router";
import DatabaseManager from "./database/database-manager";
import LogService from "./logging/log-service"
import { LogLevel } from "./logging/log-service"
import { Constants } from "./constants";

export class TroubadourServer {
    expressApp = express();
    port: number = 3000;

    Run() {
        DatabaseManager.connectToDatabase()

        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(function (req, res, next) {
            res.header(
                Constants.HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
                Constants.HTTP_CORS_ORIGIN_STAR);
            res.header(
                Constants.HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
                Constants.HTTP_CORS_HEADERS_ALLOWED
            );
            res.header(
                Constants.HTTP_HEADER_ACCESS_CONTROL_ALLOW_METHODS,
                Constants.HTTP_CORS_METHODS_ALLOWED
            )
            next();
        });

        this.expressApp.get("/", (req, res) => {
            res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_TEXT);
            res.send("Send a GET request to /song/list /drink/list to retrieve the song or drink list");
        });

        const songRouter: SongRouter = new SongRouter();
        songRouter.createRoutes();
        this.expressApp.use("/", songRouter.router);

        const drinkRouter: DrinkRouter = new DrinkRouter();
        drinkRouter.createRoutes();
        this.expressApp.use("/", drinkRouter.router);

        this.expressApp.listen(this.port, () => {
            return LogService.log(LogLevel.Info, `Troubadour server is listening on ${this.port}`);
        });
    }
}