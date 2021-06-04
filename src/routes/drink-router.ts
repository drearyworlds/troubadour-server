import express from "express";
import { DrinkRepository } from "../database/drink-repository";
import { Constants } from "../constants";
import { Drink } from "../models/drink";
import LogService from "../logging/log-service"
import { LogLevel } from "../logging/log-service"

export class DrinkRouter {
    public router = express.Router();

    // Static variable holding current drink in memory. Not persistent
    private static currentDrink: Drink;

    constructor() { }

    public createRoutes() {
        this.router.route("/drink/list")
            .get(async function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [GET] /drink/list");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let drinksArray = [];
                drinksArray = await DrinkRepository.getDrinkList();

                const drinkList = {
                    drinks: drinksArray
                };

                LogService.log(LogLevel.Info, `Retrieved drinkList from db [${drinkList.drinks.length} entries]`)

                const drinkListJson = JSON.stringify(drinkList);
                res.send(drinkListJson);
            })
            .post(async function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [POST] /drink/list");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    LogService.log(LogLevel.Info, `body: ${req.body}` || "body: null");
                    const jsonDrinkList: string = JSON.stringify(req.body);

                    LogService.log(LogLevel.Info, `jsonDrinkList: ${jsonDrinkList}`)

                    response.success = await DrinkRepository.importDrinkListFromJson(jsonDrinkList);

                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(LogLevel.Info, `Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            });

        this.router.route("/drink/data")
            .get(async function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter]:/drink/data");
                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );
                const drinkDataJson = await DrinkRepository.getDrinkData(+req.query.id);
                res.send(drinkDataJson);
            })
            .post(async function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [POST] /drink/data");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    LogService.log(LogLevel.Info, req.body || "body: null");
                    const drink = req.body;

                    response.success = await DrinkRepository.updateOrInsertDrink(drink)

                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(LogLevel.Info, `Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            })

        this.router
            .route("/drink/current")
            .get(function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [GET] /drink/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_HTML
                );

                if (DrinkRouter.currentDrink) {
                    res.send(`
                        <!DOCTYPE HTML>
                        <html>
                            <meta http-equiv="refresh" content="8">
                            <body>
                                <div>
                                    <h3>Current Drink</h3>
                                </div>
                                <div>
                                    <h1>${DrinkRouter.currentDrink.name} ${DrinkRouter.currentDrink.style}</h1>
                                </div>
                                <div>
                                    <h2>${DrinkRouter.currentDrink.brewery}</h2>
                                </div>
                                <div>
                                    <h2>${DrinkRouter.currentDrink.city}</h2>
                                </div>
                                <div>
                                    <h3>${DrinkRouter.currentDrink.suggestedBy ? "Suggested by " + DrinkRouter.currentDrink.suggestedBy : ""}</h3>
                                </div>
                            </body>
                        </html>
                    `);
                } else {
                    res.send(`
                        <!DOCTYPE HTML>
                        <html>
                            <meta http-equiv="refresh" content="1">
                            <body>
                            </body>
                        </html>
                    `);
                }
            })
            .post(function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [POST] /drink/current");

                res.setHeader(
                    Constants.HTTP_HEADER_CONTENT_TYPE,
                    Constants.HTTP_HEADER_CONTENT_TYPE_JSON
                );

                let currentDrinkText = ``;
                let response = {
                    success: false
                };

                try {
                    LogService.log(LogLevel.Info, req.body || "body: null");
                    const drink = req.body;
                    DrinkRouter.currentDrink = drink;
                    res.send(JSON.stringify(response));
                } catch {
                    LogService.log(LogLevel.Info, `Error occurred updating current drink to:\n${currentDrinkText}`);
                    res.send(JSON.stringify(response));
                }
            })
            .delete(function (req, res) {
                LogService.log(LogLevel.Info, "[DrinkRouter] [DELETE] /drink/current");
            });
    }
}