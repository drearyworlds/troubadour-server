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
                if (!await SongRepository.updateSong(song)) {
                    console.log(`Adding new song to database`);
                    SongRepository.addSong(song);
                } else {
                    console.log(`Updated song in database`);
                }
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

    public static async updateSong(songToUpdate: Song) : Promise<boolean> {
        let success = false;
        const filter = { id: songToUpdate.id };
        const result = await SongRepository.SongModel.findOneAndUpdate(filter, songToUpdate)

        if (result) {
            success = true;
            console.log(`Song updated: ${songToUpdate.artist} - ${songToUpdate.title}`)
        }

        return success;
    }

    public static addSong(songToAdd: Song) {
        const songModel = new SongRepository.SongModel(songToAdd);
        songModel.save().then((v) => {
            console.log(`Added song to Song collection: ${v}`);
        });
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