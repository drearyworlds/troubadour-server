import fs from "fs";

export class FileManager {
    public static getSongList(songListJsonPath: string, encoding: "utf8") {
        console.log("[FileManager.getSongList] [Start]");
        console.log(`[FileManager.getSongList] songListJsonPath: ${songListJsonPath}`);
        console.log(`[FileManager.getSongList] encoding: ${encoding}`);
        console.log("[FileManager.getSongList] [End]");
        return fs.readFileSync(songListJsonPath, encoding);
    }

    public static getSongData(
        songListJsonPath: string,
        encoding: "utf8",
        songArtist: string,
        songTitle: string
    ) {
        console.log("[SongRepository.getSongData] [Start]");
        const songListJson = fs.readFileSync(songListJsonPath, encoding);
        const songList = JSON.parse(songListJson);
        const songData = songList["songs"].find(
            (song: any) => song.artist == songArtist && song.title == songTitle
        );

        const songDataJson = JSON.stringify(songData);

        console.log("[SongRepository.getSongData] [End]");
        return songDataJson;
    }

    public static getSongLyrics(
        songLyricsPath: string,
        lyricsExtension: string,
        encoding: "utf8",
        artist: string,
        title: string
    ) {
        console.log("[SongRepository.getSongLyrics] [Start]");
        let sanitizedArtist: string = artist.replace(/:|;|"/g, "_");
        let sanitizedTitle: string = title.toString().replace(/:|;|"/g, "_");

        console.log(sanitizedArtist || "sanitizedArtist: null");
        console.log(sanitizedTitle || "sanitizedTitle: null");

        const songLyricsFileName = `${songLyricsPath}${sanitizedArtist} - ${sanitizedTitle}${lyricsExtension}`;
        console.log(songLyricsFileName || "songLyricsFileName: null");

        if (songLyricsFileName == null || !fs.existsSync(songLyricsFileName)) {
            return null;
        }

        const songLyrics = fs.readFileSync(songLyricsFileName, encoding);

        console.log("[SongRepository.getSongLyrics] [End]");
        return songLyrics;
    }

    public static getCurrentSong(currentSongPath: string, encoding: "utf8") {
        fs.readFileSync(currentSongPath, encoding);
    }

    public static setCurrentSong(currentSongPath: string, encoding: "utf8", song: object) {
        const currentSongText = `${song["artist"]}\n"${song["title"]}"\n${song["album"]} (${song["year"]})`;

        fs.writeFileSync(currentSongPath, currentSongText, encoding);
        console.log(`Current song updated to:\n${currentSongText}`);

        return true;
    }

    public static clearCurrentSong(currentSongPath: string, encoding: "utf8") {
        fs.writeFileSync(currentSongPath, "", encoding);
    }
}
