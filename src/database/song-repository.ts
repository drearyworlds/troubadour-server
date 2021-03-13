import mongoose from "mongoose";
import { Song, SongSchema } from "../models/song";

export class SongRepository {
    private static SongModel = mongoose.model("Song", SongSchema);

    public static async deleteAllSongs() {
        console.log("SongRepository::deleteAllSongs");
        await SongRepository.SongModel.remove({}, function (err) {
            console.log("Song collection removed");
        });
    }

    public static async importSongListFromJson(songListJson: string) {
        let success: boolean = true
        console.log("SongRepository::importSongListFromJson");

        console.log(songListJson)
        try {
            const songs: Song[] = JSON.parse(songListJson)["songs"];
            for (const song of songs) {
                await this.updateOrInsertSong(song)
            }
        } catch {
            console.log("Exception occurred importing songs")
            success = false;
        }

        if (success) {
            console.log("Song list imported: " + success)
        }

        return success;

    }

    public static async updateOrInsertSong(songToUpdateOrInsert: Song) {
        let success = false;

        success = await SongRepository.updateSong(songToUpdateOrInsert)
        if (success) {
            console.log(`Successfully updated song in Song collection`);
        } else {
            success = await SongRepository.insertSong(songToUpdateOrInsert);
            if (success) {
                console.log(`Successfully added song to Song collection`);
            }
        }

        return success;
    }

    public static async insertSong(songToAdd: Song) {
        let success: boolean = false;
        const songModel = new SongRepository.SongModel(songToAdd);
        await songModel.save().then((v) => {
            console.log(`Added song to Song collection: ${v}`);
            success = true;
        });

        return success
    }

    public static async updateSong(songToUpdate: Song): Promise<boolean> {
        let success = false;
        const filter = { id: songToUpdate.id };
        const result = await SongRepository.SongModel.findOneAndUpdate(filter, songToUpdate);

        if (result) {
            success = true;
            console.log(`Song updated: ${songToUpdate.artist} - ${songToUpdate.title}`)
        }

        return success;
    }

    public static async getSongList() {
        var query = SongRepository.SongModel.find({}).select(["-lyrics", "-_id", "-__v"]);
        const returnValue = await query.exec();
        return returnValue;
    }

    public static async getSongData(songId: number) {
        console.log(`Getting song data for songId: ${songId}`)
        var query = SongRepository.SongModel.find({ id: songId });
        const returnValue = await query.exec()
        return returnValue[0];
    }
}