import mongoose from "mongoose";
const { Schema } = mongoose;

export const SongSchema = new Schema({
    title: String,
    artist: String,
    album: String,
    year: Number,
    tuning: String,
    pick: Boolean,
    capo: Number,
    active: Boolean,
    suggestedBy: String
});