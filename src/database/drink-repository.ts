import mongoose from "mongoose";
import { Drink, DrinkSchema } from "../models/drink";
import LogService from "../logging/log-service"

export class DrinkRepository {
    private static DrinkModel = mongoose.model("Drink", DrinkSchema);

    public static async deleteAllDrinks() {
        LogService.log("DrinkRepository::deleteAllDrinks");
        await DrinkRepository.DrinkModel.remove({}, function (err) {
            LogService.log("Drink collection removed");
        });
    }

    public static async importDrinkListFromJson(drinkListJson: string) {
        let success: boolean = true
        LogService.log("DrinkRepository::importDrinkListFromJson");

        LogService.log(drinkListJson)
        try {
            const drinks: Drink[] = JSON.parse(drinkListJson)["drinks"];
            for (const drink of drinks) {
                await this.updateOrInsertDrink(drink)
            }
        } catch (e) {
            LogService.log(`Exception occurred importing drinks: ${e}`)
            success = false;
        }

        if (success) {
            LogService.log("Drink list imported: " + success)
        }

        return success;

    }

    public static async updateOrInsertDrink(drinkToUpdateOrInsert: Drink) {
        let success = false;

        success = await DrinkRepository.updateDrink(drinkToUpdateOrInsert)
        if (success) {
            LogService.log(`Successfully updated drink in Drink collection`);
        } else {
            success = await DrinkRepository.insertDrink(drinkToUpdateOrInsert);
            if (success) {
                LogService.log(`Successfully added drink to Drink collection`);
            }
        }

        return success;
    }

    public static async insertDrink(drinkToAdd: Drink) {
        let success: boolean = false;
        const drinkModel = new DrinkRepository.DrinkModel(drinkToAdd);
        await drinkModel.save().then((v) => {
            LogService.log(`Added drink to Drink collection: ${v}`);
            success = true;
        });

        return success
    }

    public static async updateDrink(drinkToUpdate: Drink): Promise<boolean> {
        let success = false;
        const filter = { id: drinkToUpdate.id };
        const result = await DrinkRepository.DrinkModel.findOneAndUpdate(filter, drinkToUpdate);

        if (result) {
            success = true;
            LogService.log(`Drink updated: ${drinkToUpdate.brewery} - ${drinkToUpdate.name}`)
        }

        return success;
    }

    public static async getDrinkList() {
        var query = DrinkRepository.DrinkModel.find({}).select(["-_id", "-__v"]);
        const returnValue = await query.exec();
        return returnValue;
    }

    public static async getDrinkData(drinkId: number) {
        LogService.log(`Getting drink data for drinkId: ${drinkId}`)
        var query = DrinkRepository.DrinkModel.find({ id: drinkId });
        const returnValue = await query.exec()
        return returnValue[0];
    }
}