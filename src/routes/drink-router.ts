import express from "express";
import { DrinkRepository } from "../database/drink-repository";
import { Constants } from "../config/Constants";
import { Drink } from "../models/drink";

export class DrinkRouter {
    public router = express.Router();

    // Static variable holding current drink in memory. Not persistent
    private static currentDrink: Drink;

    constructor() { }

    public createRoutes() {
        this.router.route("/drink/list")
            .get(async function (req, res) {
                console.log("[DrinkRouter] [GET] /drink/list");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let drinksArray = [];
                drinksArray = await DrinkRepository.getDrinkList();

                const drinkList = {
                    drinks: drinksArray
                };

                console.log(`Retrieved drinkList from db [${drinkList.drinks.length} entries]`)

                const drinkListJson = JSON.stringify(drinkList);
                res.send(drinkListJson);
            })
            .post(async function (req, res) {
                console.log("[DrinkRouter] [POST] /drink/list");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(`body: ${req.body}` || "body: null");
                    const jsonDrinkList: string = JSON.stringify(req.body);

                    console.log(`jsonDrinkList: ${jsonDrinkList}`)

                    response.success = await DrinkRepository.importDrinkListFromJson(jsonDrinkList);

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            });

        this.router.route("/drink/data")
            .get(async function (req, res) {
                console.log("[DrinkRouter]:/drink/data");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );
                const drinkDataJson = await DrinkRepository.getDrinkData(+req.query.id);
                res.send(drinkDataJson);
            })
            .post(async function (req, res) {
                console.log("[DrinkRouter] [POST] /drink/data");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(req.body || "body: null");
                    const drink = req.body;
        
                    response.success = await DrinkRepository.updateOrInsertDrink(drink)

                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            })

        this.router
            .route("/drink/current")
            .get(function (req, res) {
                console.log("[DrinkRouter] [GET] /drink/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_HTML
                );

                if (DrinkRouter.currentDrink) {
                    res.send(`<!DOCTYPE HTML>
<html>
    <body>
        <div class="label">Current drink:</div>
        <div class="data">${DrinkRouter.currentDrink.name} ${DrinkRouter.currentDrink.style}</div>
        <div class="data">${DrinkRouter.currentDrink.brewery}</div>
        <div class="data">${DrinkRouter.currentDrink.city}</div>
    </body>
</html>
                `);
                } else {
                    res.send(`<!DOCTYPE HTML>
<html>
    <body>
        <div class="label">Current drink:</div>
        <div class="data">[None]</div>
    </body>
</html>
                `);

                }
            })
            .post(function (req, res) {
                console.log("[DrinkRouter] [POST] /drink/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    console.log(req.body || "body: null");
                    const drink = req.body;
                    DrinkRouter.currentDrink = drink;
                    res.send(JSON.stringify(response));
                } catch {
                    console.log(`Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                console.log("[DrinkRouter] [DELETE] /drink/current");
            });
    }
}