import mongoose from "mongoose";
const { Schema } = mongoose;

export class Song {
    id : Number
    title: String
    artist: String
    album: String
    year: Number
    tuning: String
    pick: Boolean
    capo: Number
    active: Boolean
    suggestedBy: String
    lyrics: String
}

export const schema = new Schema({
    id: Number,
    title: String,
    artist: String,
    album: String,
    year: Number,
    tuning: String,
    pick: Boolean,
    capo: Number,
    active: Boolean,
    suggestedBy: String,
    lyrics: String
});