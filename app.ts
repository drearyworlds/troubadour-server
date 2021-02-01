import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import { config } from "./config.json"

const app = express();
const port = 3000;
const ENCODING_UTF8 = "utf8";
const DATA_PATH = config["data-path"] || "./data/";
const SONGS_PATH = `${DATA_PATH}songs/`;
const SONGLIST_JSON = `${DATA_PATH}songList.json`;
const LYRICS_EXTENSION = config["lyrics-extension"] || ".txt";
const DRINKLIST_JSON = `${DATA_PATH}drinkList.json`;
const CURRENTSONG_TXT = `${DATA_PATH}currentsong.txt`;
const CURRENTDRINK_TXT = `${DATA_PATH}currentdrink.txt`;
const HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
const HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
const HTTP_CORS_ORIGIN_STAR = "*";
const HTTP_CORS_HEADERS_ALLOWED = "Origin, X-Requested-With, Content-Type, Accept";
const HTTP_HEADER_CONTENT_TYPE = "Content-Type"
const HTTP_HEADER_CONTENT_TYPE_JSON = "application/json"
const HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header(HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, HTTP_CORS_ORIGIN_STAR);
  res.header(
    HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
    HTTP_CORS_HEADERS_ALLOWED
  );
  next();
});

app.get("/", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT)
  res.send(
    "Send a GET request to /songlist /drinklist to retrieve the song or drink list"
  );
});

app.get("/songlist", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON)
  const songListJson = fs.readFileSync(SONGLIST_JSON, ENCODING_UTF8);
  res.send(songListJson);
});

app.get("/songlyrics", (req, res) => {
  // TODO: String out special characters from artist/title to find correct filename
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT)
  console.log(req.query.artist || "req.query.artist: null");
  console.log(req.query.title || "req.query.title: null");
  const songLyricsFileName = `${SONGS_PATH}${req.query.artist} - ${req.query.title}${LYRICS_EXTENSION}`;
  console.log(songLyricsFileName || "songLyricsFileName: null");
  const songLyrics = fs.readFileSync(songLyricsFileName, ENCODING_UTF8);
  res.send(songLyrics);
});

app.post("/currentsong/clear", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_TEXT)
  try {
    fs.writeFileSync(CURRENTSONG_TXT, "", ENCODING_UTF8);
    res.send(true);
  } catch {
    res.send(`Error clearing current song`);
  }
});

app.post("/currentsong/update", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON)

  let currentDrinkText = ``;
  let response = {
    success: false,
  };

  try {
    console.log(req.body || "body: null");
    const song = req.body;

    // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)
    currentDrinkText = `${song["artist"]}\n${song["title"]}\n${song["album"]} (${song["year"]})`;

    fs.writeFileSync(CURRENTSONG_TXT, currentDrinkText, ENCODING_UTF8);
    console.log(`Current song updated to:\n${currentDrinkText}`);
    response.success = true;
    res.send(JSON.stringify(response));
  } catch {
    console.log(
      `Error occurred updating current song to:\n${currentDrinkText}`
    );
    res.send(JSON.stringify(response));
  }
});

app.get("/drinklist", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON)
  const contents = fs.readFileSync(DRINKLIST_JSON, ENCODING_UTF8);
  res.send(contents);
});

app.post("/currentdrink/clear", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON)

  try {
    fs.writeFileSync(CURRENTDRINK_TXT, "", ENCODING_UTF8);
    res.send(true);
  } catch {
    res.send(`Error clearing current drink`);
  }
});

app.post("/currentdrink/update", (req, res) => {
  res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON)

  let currentDrinkText = ``;
  let response = {
    success: false,
  };

  try {
    const drink = req.body;

    // TODO: Ensure drink exists in drinklist (so as not to update current drink to arbitrary value)
    currentDrinkText = `${drink["name"]}\n${drink["style"]}\n${drink["brewery"]} (${drink["city"]})`;

    fs.writeFileSync(CURRENTDRINK_TXT, currentDrinkText, ENCODING_UTF8);
    console.log(`Current drink updated to:\n${currentDrinkText}`);
    response.success = true;
    res.send(JSON.stringify(response));
  } catch {
    console.log(
      `Error occurred updating current drink to:\n${currentDrinkText}`
    );
    res.send(JSON.stringify(response));
  }
});

app.listen(port, () => {
  return console.log(`songlistserver is listening on ${port}`);
});
