import mongoose from "mongoose";
const { Schema } = mongoose;

interface SsSong {
    artist: string;
    title: string;
    album: string;
    year: number;
    capo: number;
    active: boolean;
    comment: string;
    lyrics: string;
    chords: string;
    tab: string;
}

export interface Song extends SsSong {
    id?: number;
    tuning: string;
    pick: boolean;
    composer : string;
    suggestedBy: String;
}

export const SongSchema = new Schema({
    artist: String,
    title: String,
    album: String,
    year: Number,
    capo: Number,
    active: Boolean,
    comment: String,
    lyrics: String,
    chords: String,
    tab: String,

    id: Number,
    tuning: String,
    pick: Boolean,
    composer : String
});