import mongoose from "mongoose";
const { Schema } = mongoose;

export interface Drink {
    id?: number;
    name: string;
    style: boolean;
    brewery : string;
    city: string;
}

export const DrinkSchema = new Schema({
    id: Number,
    name: String,
    style: Boolean,
    brewery : String,
    city: String
});