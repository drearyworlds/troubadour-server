import mongoose from "mongoose";
import { Song, schema as SongSchema } from "../models/Song";
import { FileManager } from "../file/FileManager";
import { Constants } from "../config/Constants";

export class SongRepository {
    private static SongModel = mongoose.model("Song", SongSchema);

    public static async deleteAllSongs() {
        console.log("SongRepository::deleteAllSongs");
        await SongRepository.SongModel.remove({}, function (err) {
            console.log("Song collection removed");
        });
    }

    public static async populateFromJsonFile() {
        console.log("SongRepository::populateDatabase");
        const songsJson = FileManager.getSongList(Constants.SONGLIST_JSON, Constants.ENCODING_UTF8);
        const songs: Song[] = JSON.parse(songsJson)["songs"];
        for (const song of songs) {
            if (!await SongRepository.updateSong(song)) {
                console.log(`Adding new song to database`);
                SongRepository.addSong(song);
            } else {
                console.log(`Updated song in database`);
            }

        }
    }

    public static async updateSong(songToUpdate: Song) {
        const filter = { artist: songToUpdate.artist, title: songToUpdate.title };
        const success = await SongRepository.SongModel.findOneAndUpdate(filter, songToUpdate)

        console.log("Song updated: " + success)
        return success;
    }

    public static addSong(songToAdd: Song) {
        const songModel = new SongRepository.SongModel(songToAdd);
        songModel.save().then((v) => {
            console.log(`Added song to Song collection: ${v}`);
        });
    }

    public static async getSongList() {
        var query = SongRepository.SongModel.find({}).select({});
        const returnValue = await query.exec();
        return returnValue;
    }
}
