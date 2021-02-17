import express from "express";
import fs from "fs";
import Configuration from "../config"

const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
const HTTP_HEADER_CONTENT_TYPE_JSON = "application/json";
const HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";
const ENCODING_UTF8 = "utf8";

const DRINKLIST_JSON = `${Configuration.getDataPath()}drinkList.json`;
const CURRENTDRINK_TXT = `${Configuration.getDataPath()}currentdrink.txt`;

export const router = express.Router()

router.get("/drinklist", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);
    const contents = fs.readFileSync(DRINKLIST_JSON, ENCODING_UTF8);
    res.send(contents);
});

router.post("/currentdrink/clear", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);

    try {
        fs.writeFileSync(CURRENTDRINK_TXT, "", ENCODING_UTF8);
        res.send(true);
    } catch {
        res.send(`Error clearing current drink`);
    }
});

router.post("/currentdrink/update", (req, res) => {
    res.setHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_JSON);

    let currentDrinkText = ``;
    let response = {
        success: false
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
        console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
        res.send(JSON.stringify(response));
    }
});