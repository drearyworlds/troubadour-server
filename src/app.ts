import express from "express";
import bodyParser from "body-parser";
import { SongsRouter } from "./routes/songs";
import { router as DrinksRouter } from "./routes/drinks";
import DatabaseManager from "./database/DatabaseManager";
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
    res.send("Send a GET request to /songlist /drinklist to retrieve the song or drink list");
});

const songsRouter: SongsRouter = new SongsRouter();
songsRouter.createRoutes();
app.use("/", songsRouter.router);

app.use("/", DrinksRouter);

app.listen(port, () => {
    return console.log(`songlistserver is listening on ${port}`);
});
