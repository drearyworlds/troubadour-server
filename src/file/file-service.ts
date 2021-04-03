import fs from "fs";
import LogService from "../logging/log-service"

export class FileService {
    // Deprecated
    public static getSongList(songListJsonPath: string, encoding: "utf8") {
        LogService.log("[FileService.getSongList] [Start]");
        LogService.log(`[FileService.getSongList] songListJsonPath: ${songListJsonPath}`);
        LogService.log(`[FileService.getSongList] encoding: ${encoding}`);
        LogService.log("[FileService.getSongList] [End]");
        return fs.readFileSync(songListJsonPath, encoding);
    }

    // Deprecated
    private static getSongData(
        songListJsonPath: string,
        encoding: "utf8",
        songArtist: string,
        songTitle: string
    ) {
        LogService.log("[SongRepository.getSongData] [Start]");
        const songListJson = fs.readFileSync(songListJsonPath, encoding);
        const songList = JSON.parse(songListJson);
        const songData = songList["songs"].find(
            (song: any) => song.artist == songArtist && song.title == songTitle
        );

        const songDataJson = JSON.stringify(songData);

        LogService.log("[SongRepository.getSongData] [End]");
        return songDataJson;
    }

    // Deprecated
    private static getSongLyrics(
        songLyricsPath: string,
        lyricsExtension: string,
        encoding: "utf8",
        artist: string,
        title: string
    ) {
        LogService.log("[SongRepository.getSongLyrics] [Start]");
        let sanitizedArtist: string = artist.replace(/:|;|"/g, "_");
        let sanitizedTitle: string = title.toString().replace(/:|;|"/g, "_");

        LogService.log(sanitizedArtist || "sanitizedArtist: null");
        LogService.log(sanitizedTitle || "sanitizedTitle: null");

        const songLyricsFileName = `${songLyricsPath}${sanitizedArtist} - ${sanitizedTitle}${lyricsExtension}`;
        LogService.log(songLyricsFileName || "songLyricsFileName: null");

        if (songLyricsFileName == null || !fs.existsSync(songLyricsFileName)) {
            return null;
        }

        const songLyrics = fs.readFileSync(songLyricsFileName, encoding);

        LogService.log("[SongRepository.getSongLyrics] [End]");
        return songLyrics;
    }

    public static getCurrentSong(currentSongPath: string, encoding: "utf8") {
        fs.readFileSync(currentSongPath, encoding);
    }

    public static setCurrentSong(currentSongPath: string, encoding: "utf8", song: object) {
        const currentSongText = `${song["artist"]}\n"${song["title"]}"\n${song["album"]} (${song["year"]})`;

        LogService.log(`Updating current song at: ${currentSongPath}`);
        fs.writeFileSync(currentSongPath, currentSongText, encoding);
        LogService.log(`Current song updated to:\n${currentSongText}`);

        return true;
    }

    public static clearCurrentSong(currentSongPath: string, encoding: "utf8") {
        fs.writeFileSync(currentSongPath, "", encoding);
    }
}
