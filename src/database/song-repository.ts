import mongoose from "mongoose";
import { Song, SongSchema } from "../models/song";
import LogService from "../logging/log-service"
import { LogLevel } from "../logging/log-service"

export class SongRepository {
    private static SongModel = mongoose.model("Song", SongSchema);

    public static async deleteAllSongs() {
        LogService.log(LogLevel.Info, "SongRepository::deleteAllSongs");
        await SongRepository.SongModel.remove({}, function (err) {
            LogService.log(LogLevel.Info, "Song collection removed");
        });
    }

    public static async importSongListFromJson(songListJson: string) {
        let success: boolean = true
        LogService.log(LogLevel.Info, "SongRepository::importSongListFromJson");

        LogService.log(LogLevel.Info, songListJson)
        try {
            const songs: Song[] = JSON.parse(songListJson)["songs"];
            for (const song of songs) {
                await this.updateOrInsertSong(song)
            }
        } catch {
            LogService.log(LogLevel.Info, "Exception occurred importing songs")
            success = false;
        }

        if (success) {
            LogService.log(LogLevel.Info, "Song list imported: " + success)
        }

        return success;

    }

    public static async updateOrInsertSong(songToUpdateOrInsert: Song) {
        let success = false;

        success = await SongRepository.updateSong(songToUpdateOrInsert)
        if (success) {
            LogService.log(LogLevel.Info, `Successfully updated song in Song collection`);
        } else {
            success = await SongRepository.insertSong(songToUpdateOrInsert);
            if (success) {
                LogService.log(LogLevel.Info, `Successfully added song to Song collection`);
            }
        }

        return success;
    }

    public static async insertSong(songToAdd: Song) {
        let success: boolean = false;
        const songModel = new SongRepository.SongModel(songToAdd);
        await songModel.save().then((v) => {
            LogService.log(LogLevel.Info, `Added song to Song collection: ${v}`);
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
            LogService.log(LogLevel.Info, `Song updated: ${songToUpdate.artist} - ${songToUpdate.title}`)
        }

        return success;
    }

    public static async getSongList(): Promise<mongoose.Document<Song>[]> {
        var query = SongRepository.SongModel.find({}).select(["-lyrics", "-_id", "-__v"]);
        const returnValue: mongoose.Document<Song>[] = await query.exec();
        return returnValue;
    }

    public static async getSongData(songId: number) {
        LogService.log(LogLevel.Info, `Getting song data for songId: ${songId}`)
        var query = SongRepository.SongModel.find({ id: songId });
        const returnValue = await query.exec()
        return returnValue[0];
    }
}