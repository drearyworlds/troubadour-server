import mongoose from "mongoose";
const { Schema } = mongoose;

export interface Drink {
    id?: number;
    name: string;
    style: string;
    brewery : string;
    city: string;
}

export const DrinkSchema = new Schema({
    id: Number,
    name: String,
    style: String,
    brewery : String,
    city: String
});