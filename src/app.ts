import express from "express";
import bodyParser from "body-parser";
import { Configuration } from "./config";
import mongoose from "mongoose";
import { SongsRouter } from "./routes/songs"
import { DrinksRouter } from "./routes/drinks"
//import { SongSchema } from "./models/Song";

const app = express();
const port = 3000;
const config = new Configuration();

const HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
const HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
const HTTP_CORS_ORIGIN_STAR = "*";
const HTTP_CORS_HEADERS_ALLOWED = "Origin, X-Requested-With, Content-Type, Accept";
const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
const HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";

// async function connectToDatabase() {
//     await mongoose.connect("mongodb://localhost/my_database", {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//         useCreateIndex: true
//     });

//     return mongoose.connection;
// }

// connectToDatabase().then((db) => {
//     const Song = mongoose.model("Song", SongSchema);
//     const song = new Song({ title: "Another Song" });

//     song.save().then((v) => {
//         console.log(v);

//         Song.find(function (err, songs) {
//             if (err) return console.error(err);
//             console.log(songs);
//         });
//     });
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header(HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, HTTP_CORS_ORIGIN_STAR);
    res.header(HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS, HTTP_CORS_HEADERS_ALLOWED);
    next();
});

app.get("/", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT);
    res.send("Send a GET request to /songlist /drinklist to retrieve the song or drink list");
});

app.use("/", SongsRouter)
app.use("/", DrinksRouter)

app.listen(port, () => {
    return console.log(`songlistserver is listening on ${port}`);
});
