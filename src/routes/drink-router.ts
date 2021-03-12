import express from "express";
import { Constants } from "../config/Constants";
import { DrinkRepository } from "../database/drink-repository";
import { Drink } from "../models/drink";
import fs from "fs";

export class DrinkRouter {
    public router = express.Router();

    // Static variable holding current song in memory. Not persistent
    private static currentDrink: Drink;

    constructor() { }

    public createRoutes() {
        this.router.route("/drink/list")
            .get((req, res) => {
                // res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);
                // const contents = fs.readFileSync(Constants.DRINKLIST_JSON, Constants.ENCODING_UTF8);
                // res.send(contents);
            });


        this.router.route("/drink/current")
            .get((req, res) => {
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                try {
                    DrinkRouter.currentDrink = null;
                    let currentDrinkText = `${DrinkRouter.currentDrink["name"]}\n${DrinkRouter.currentDrink["style"]}\n${DrinkRouter.currentDrink["brewery"]} (${DrinkRouter.currentDrink["city"]})`;
                    res.send(currentDrinkText);
                } catch {
                    res.send(`Error clearing current drink`);
                }
            })
            .post((req, res) => {
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    const drink = req.body;
                    DrinkRouter.currentDrink = drink;

                    currentDrinkText = `${drink["name"]}\n${drink["style"]}\n${drink["brewery"]} (${drink["city"]})`;
                    console.log(`Current drink updated to:\n${currentDrinkText}`);
                    response.success = true;
                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete((req, res) => {
                res.setHeader(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_HEADER_CONTENT_TYPE_JSON);

                try {
                    DrinkRouter.currentDrink = null;
                    res.send(true);
                } catch {
                    res.send(`Error clearing current drink`);
                }
            });
    }
}