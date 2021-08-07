import mongoose from "mongoose";
const { Schema } = mongoose;

export interface Song {
    // Maps to id on SsSong
    ssId: number,

    // Maps directly to fields on SsSong
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

    dateAdded: Date, //createdAt
    lastPlayed: Date,
    playCount: number, //timesPlayed

    // Fields that do not exist on SsSong
    id?: number;
    tuning: string;
    pick: boolean;
    composer: string;
    suggestedBy: String;
}

export const SongSchema = new Schema({
    ssId: Number,

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
    composer: String,
    suggestedBy: String
});

export class SsSong {
    // Maps to ssId on Song
    id: number = 0;

    // Maps to custom JSON structure on Song
    comment: string;

    // Maps directly to fields on Song
    title: string = "";
    artist: string = "";
    capo: number = 0;
    active: boolean = false;
    chords: string = "";
    lyrics: string = "";
    tab: string = "";

    createdAt: Date;
    lastPlayed: Date;
    timesPlayed: number;

    attributes: AttributeEntity[] = [];
}

class AttributeEntity {
}

interface SongRequest {
    id: number;
    name: string;
}

export interface QueueEntry {
    id: number;
    song: Song;
    position: number;
    requests: SongRequest[];
}

export interface SongQueue {
    list: QueueEntry[];
}

interface SsRequest {
    id: number;
    name: string;
}

export interface SsQueueEntry {
    id: number;
    song: SsSong;
    position: number;
    requests: SsRequest[];
}

export interface SsQueue {
    list: SsQueueEntry[];
}