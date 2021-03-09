import express from "express";
import bodyParser from "body-parser";
import { SongRouter } from "./routes/song-router";
import { DrinkRouter } from "./routes/drink-router";
import DatabaseManager from "./database/database-manager";
import { Constants } from "./config/Constants";
import "./sanchezbot/sanchezbot"

const app = express();
const port = 3000;

DatabaseManager.connectToDatabase()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header(Constants.HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, Constants.HTTP_CORS_ORIGIN_STAR);
    res.header(
        Constants.HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
        Constants.HTTP_CORS_HEADERS_ALLOWED
    );
    next();
});

app.get("/", (req, res) => {
    res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_TEXT);
    res.send("Send a GET request to /song/list /drink/list to retrieve the song or drink list");
});

const songRouter: SongRouter = new SongRouter();
songRouter.createRoutes();
app.use("/", songRouter.router);

const drinkRouter: DrinkRouter = new DrinkRouter();
drinkRouter.createRoutes();
app.use("/", drinkRouter.router);

app.listen(port, () => {
    return console.log(`Troubadour server is listening on ${port}`);
});
