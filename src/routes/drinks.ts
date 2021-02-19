import express from "express";
import fs from "fs";
import { Constants } from "../config/Constants"

export const router = express.Router()

router.get("/drinklist", (req, res) => {
    res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);
    const contents = fs.readFileSync(Constants.DRINKLIST_JSON, Constants.ENCODING_UTF8);
    res.send(contents);
});

router.post("/currentdrink/clear", (req, res) => {
    res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

    try {
        fs.writeFileSync(Constants.CURRENTDRINK_TXT, "", Constants.ENCODING_UTF8);
        res.send(true);
    } catch {
        res.send(`Error clearing current drink`);
    }
});

router.post("/currentdrink/update", (req, res) => {
    res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

    let currentDrinkText = ``;
    let response = {
        success: false
    };

    try {
        const drink = req.body;

        // TODO: Ensure drink exists in drinklist (so as not to update current drink to arbitrary value)
        currentDrinkText = `${drink["name"]}\n${drink["style"]}\n${drink["brewery"]} (${drink["city"]})`;

        fs.writeFileSync(Constants.CURRENTDRINK_TXT, currentDrinkText, Constants.ENCODING_UTF8);
        console.log(`Current drink updated to:\n${currentDrinkText}`);
        response.success = true;
        res.send(JSON.stringify(response));
    } catch {
        console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
        res.send(JSON.stringify(response));
    }
});