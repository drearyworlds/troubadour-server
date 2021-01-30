import express from 'express';
import fs from 'fs'
import bodyParser from 'body-parser'

const app = express();
const port = 3000;
const ENCODING_UTF8 = 'utf8';
const SONGLIST_JSON = "./data/songList.json";
const CURRENTSONG_TXT = "./data/currentsong.txt"
const HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin"
const HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers"
const HTTP_CORS_ORIGIN_LOCALHOST_4200 = "http://localhost:4200"
 const HTTP_CORS_HEADERS_ALLOWED = "Origin, X-Requested-With, Content-Type, Accept"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header(HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, HTTP_CORS_ORIGIN_LOCALHOST_4200);
  res.header(HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS, HTTP_CORS_HEADERS_ALLOWED);
  next();
});

app.get('/', (req, res) => {
  res.send('Send a GET request to /songlist to retrieve the song list');
});

app.get('/songlist', (req, res) => {
  const contents = fs.readFileSync(SONGLIST_JSON, ENCODING_UTF8);
  res.send(contents);
});

app.post('/currentsong/clear', (req, res) => {
  try {
    fs.writeFileSync(CURRENTSONG_TXT, "", ENCODING_UTF8);
    res.send(true);
  } catch {
    res.send(`Error clearing current song`);
  }
});

app.post('/currentsong/update', (req, res) => {
  console.log("current song update called");
  let currentSongText = ``;
  let response = {
    success: false
  }

  try {
    console.log(req.body || "body: null");
    const song = req.body;

    // TODO: Ensure song exists in songlist (so as not to update current song to arbitrary value)
    currentSongText = `${song['artist']}\n${song['title']}\n${song['album']} (${song['year']})`;

    fs.writeFileSync(CURRENTSONG_TXT, currentSongText, ENCODING_UTF8);
    console.log(`Current song updated to:\n${currentSongText}`);
    response.success = true
    res.send(JSON.stringify(response));
  } catch {
    console.log(`Error occurred updating current song to:\n${currentSongText}`);
    res.send(JSON.stringify(response));
  }
});

app.listen(port, () => {
  return console.log(`songlistserver is listening on ${port}`);
});