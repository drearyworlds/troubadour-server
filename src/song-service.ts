import { SongRepository } from "./database/song-repository";
import { Constants } from "./constants";
import Configuration from "./config/configuration-service";
import { Song, SongQueue, QueueEntry, SsSong } from "./models/song";
import LogService, { LogLevel } from "./logging/log-service"
import fetch from "node-fetch"

class SongService {
    static instance: SongService;
    songs: Song[] = [];
    ssSongs: SsSong[] = [];

    // Variable holding current song in memory. Not persistent
    private currentSong: Song;

    constructor() { }

    public static getInstance(): SongService {
        if (!SongService.instance) {
            SongService.instance = new SongService();
        }
        return SongService.instance;
    }

    async getSongList(): Promise<string> {
        const methodName = this.getSongList.name;

        // Get songlist from database
        var songDocuments = await SongRepository.getSongList();
        this.log(LogLevel.Info, `Retrieved songs from db (${songDocuments.length} entries)`, methodName)
        this.songs = JSON.parse(JSON.stringify(songDocuments));

        // Get songlist from StreamerSonglist
        var ssSongListResponse = await this.getSsSongList();
        this.ssSongs = JSON.parse(ssSongListResponse);
        this.log(LogLevel.Info, `Retrieved songs from SS (${this.ssSongs.length} entries)`, methodName)

        for (var song of this.songs) {
            this.log(LogLevel.Verbose, `Matching song: ${song.title}`, methodName)
            this.mergeSong(song);
        }

        var response = JSON.stringify(this.songs);
        this.log(LogLevel.Verbose, "Stringified response: " + response, methodName);
        return response;
    }

    // Merge tries to find a matching song in ssSongs by ssId or artist/title,
    // If it matches, it will update the ssId on the song
    // and return the ssSong populated with the data from the song.
    // Otherwise, it will return null
    private mergeSong(song: Song): SsSong {
        const methodName = this.mergeSong.name;
        var matched: boolean = false;
        var ssSong: SsSong = null;

        for (var existingSsSong of this.ssSongs) {
            if (song.ssId == existingSsSong.id) {
                this.log(LogLevel.Verbose, `Matched by ssId: ${song.ssId}`, methodName)
                ssSong = existingSsSong;
                matched = true;
                break;
            } else if (song.artist == existingSsSong.artist && song.title == existingSsSong.title) {
                this.log(LogLevel.Verbose, `Matched by artist/title: ${song.artist}/${song.title}`, methodName)
                ssSong = existingSsSong;
                matched = true;
                break;
            }
        }

        if (matched) {
            // Update the data for which SsSong is source of truth
            this.setSongFieldsFromSsSong(song, ssSong);

            // Update the data for which Song is source of truth
            this.setSsSongFieldsFromSong(ssSong, song);
        } else {
            this.log(LogLevel.Warning, "Could not find a match for song: " + JSON.stringify(song), methodName);

            try {
                // Maybe a live learn? Create a new SsSong Entry
                ssSong = new SsSong();
                ssSong.id = song.ssId;

                // Update the data for which Song is source of truth
                this.setSsSongFieldsFromSong(ssSong, song);
            } catch (e) {
                this.log(LogLevel.Exception, e, methodName);
            }
        }

        return ssSong;
    }

    // Merge tries to find a matching song in songs by ssId or artist/title,
    // If it matches, it will update the ssId on the Song
    // and return the matched Song populated with the data from the SsSong.
    // Otherwise, it will return null
    private mergeSsSong(ssSong: SsSong) {
        const methodName = this.mergeSsSong.name;
        try {
            var matched: boolean = false;
            var songToReturn: Song = null;

            for (var existingSong of this.songs) {
                if (ssSong.id == existingSong.id) {
                    this.log(LogLevel.Verbose, `Matched by ssId: ${ssSong.id}`, methodName)
                    songToReturn = existingSong;
                    matched = true;
                    break;
                } else if (ssSong.artist == existingSong.artist && ssSong.title == existingSong.title) {
                    this.log(LogLevel.Verbose, `Matched by artist/title: ${ssSong.artist}/${ssSong.title}`, methodName)
                    songToReturn = existingSong;
                    matched = true;
                    break;
                }
            }

            if (matched) {
                this.log(LogLevel.Verbose, "Matching fields from song", methodName);

                // Update everything on the SsSong object
                this.setSsSongFieldsFromSong(ssSong, songToReturn);
            } else {
                // Update everything on the Song object
                songToReturn = new Song();

                if (ssSong.title) {
                    songToReturn.title = ssSong.title;
                }
                this.setSongFieldsFromSsSong(songToReturn, ssSong);
                this.log(LogLevel.Warning, "Could not find a match for ssSong: " + JSON.stringify(ssSong), methodName);
            }
        } catch (e) {
            this.log(LogLevel.Failure, e.Message, methodName);
        }

        return songToReturn;
    }

    private setSongFieldsFromSsSong(song: Song, ssSong: SsSong) {
        const methodName = this.setSongFieldsFromSsSong.name;
        //this.log(LogLevel.Verbose, "Setting fields on Song from SsSong", methodName);

        song.ssId = ssSong.id;
        song.dateAdded = ssSong.createdAt;
        song.datePlayed = ssSong.lastPlayed;
        song.playCount = ssSong.timesPlayed;
    }

    private setSsSongFieldsFromSong(ssSong: SsSong, song: Song) {
        const methodName = this.setSsSongFieldsFromSong.name;
        //this.log(LogLevel.Verbose, "Setting fields on SsSong from Song", methodName);

        ssSong.artist = song.artist;
        ssSong.title = song.title;
        ssSong.active = song.active;
        ssSong.capo = song.capo;
        ssSong.comment = JSON.stringify({
            album: song.album,
            year: song.year,
            suggestedBy: song.suggestedBy,
            tuning: song.tuning,
            pick: song.pick,
            composer: song.composer,
            id: song.id
        });
        ssSong.lyrics = song.lyrics;
        ssSong.chords = song.chords;
        ssSong.tab = song.tab
    }

    private async getSsSongList(): Promise<string> {
        const methodName = this.getSsSongList.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_SONGS;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        let params: URLSearchParams = new URLSearchParams()
        params.append('current', "0")
        params.append('size', "0")
        params.append('showInactive', "true")
        params.append('isNew', "false")
        params.append('order', "asc")

        url.search = params.toString();
        this.log(LogLevel.Info, `url.search: ${url.search}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server",
                "x-ssl-user-types": "streamer"
            }
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);
        const responseJson = await response.json();
        const responseJsonItemsString = JSON.stringify(responseJson.items);
        this.log(LogLevel.Info, `Got songs from SS (${responseJson.items.length})`, methodName);
        return responseJsonItemsString;
    }

    async getSongById(songId: number): Promise<string> {
        const methodName = this.getSongById.name;
        const songDocument = await SongRepository.getSongData(songId);

        if (songDocument) {
            this.log(LogLevel.Info, `Fetched song by ID: ${songDocument.id}`, methodName);
            let song: Song = JSON.parse(JSON.stringify(songDocument));
            this.mergeSong(song)
            const songJson = JSON.stringify(song);
            this.log(LogLevel.Verbose, `Fetched song by ID (json): ${songJson}`, methodName);
            return songJson;
        }

        return null;
    }

    async importSongListFromJson(jsonSongList: string): Promise<boolean> {
        const methodName = this.importSongListFromJson.name;
        return SongRepository.importSongListFromJson(jsonSongList);
    }

    async getQueue(): Promise<string> {
        const methodName = this.getQueue.name;

        // Get songlist from database
        var songDocuments = await SongRepository.getSongList();
        this.log(LogLevel.Info, `Retrieved songs from db (${songDocuments.length} entries)`, methodName)
        this.songs = JSON.parse(JSON.stringify(songDocuments));

        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_QUEUE;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const response = await fetch(url, {
            method: 'GET'
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        let ssQueueEntries = await response.json();

        this.log(LogLevel.Verbose, `ssQueueEntries: ${JSON.stringify(ssQueueEntries)}`, methodName);

        let songQueue: SongQueue = {
            list: []
        };
        for (let ssQueueEntry of ssQueueEntries.list) {
            if (!ssQueueEntry.song) {
                ssQueueEntry.song = new SsSong();
                ssQueueEntry.song.title = ssQueueEntry.nonlistSong;
            }

            let queueEntry: QueueEntry = {
                id: ssQueueEntry.id,
                position: ssQueueEntry.position,
                requests: ssQueueEntry.requests[0],
                song: this.mergeSsSong(ssQueueEntry.song)
            };
            songQueue.list.push(queueEntry);
        }

        var songQueueJson = JSON.stringify(songQueue);

        this.log(LogLevel.Verbose, `songQueueJson: ${songQueueJson}`, methodName);

        return songQueueJson;

    }

    async addToQueue(songId: number): Promise<string> {
        const methodName = this.addToQueue.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        // Get the song, which should have an ssId
        let song: Song = JSON.parse(await this.getSongById(songId))

        let urlString = Constants.URL_SS_QUEUE_REQUEST;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
        urlString = urlString.replace(/{songId}/g, song.ssId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            }
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        return responseJson;
    }

    async markAsPlayed(queueId: number): Promise<string> {
        const methodName = this.markAsPlayed.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_QUEUE_PLAYED;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
        urlString = urlString.replace(/{queueId}/g, queueId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            }
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        this.log(LogLevel.Info, `responseJson: ${responseJson}`, methodName);

        return responseJson;
    }

    async markNonQueueSongAsPlayed(songId: number): Promise<string> {
        const methodName = this.markNonQueueSongAsPlayed.name;

        this.log(LogLevel.Info, "test1", methodName);

        const streamerId = Configuration.getStreamerId()

        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_PLAY_HISTORY;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const postBody = {
            "song": {
                "id": songId
            },
            "streamer": {
                "id": streamerId
            }
        }

        const postJson = JSON.stringify(postBody)
        this.log(LogLevel.Verbose, `ssSongJson: ${postJson}`, methodName);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            },
            body: postJson
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        this.log(LogLevel.Info, `responseJson: ${JSON.stringify(responseJson)}`, methodName);

        return responseJson;
    }

    async removeFromQueue(queueId: number): Promise<string> {
        const methodName = this.removeFromQueue.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_QUEUE_REMOVE;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
        urlString = urlString.replace(/{queueId}/g, queueId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            }
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        return responseJson;
    }

    setSongAsCurrent(song: Song): boolean {
        const methodName = this.setSongAsCurrent.name;
        let success: boolean = false;

        try {
            this.currentSong = song;
            success = true;
        } catch {
            this.log(LogLevel.Info, `Error occurred updating current song to:\n${song.title}`, methodName);
            success = false;
        }

        return success;
    }

    clearCurrentSong(): boolean {
        const methodName = this.clearCurrentSong.name;
        this.currentSong = null;
        return true;
    }

    getCurrentSongOverlay(): string {
        const methodName = this.getCurrentSongOverlay.name;
        if (this.currentSong) {
            let artistComposerString = this.currentSong.artist;

            if (this.currentSong.composer
                && this.currentSong.composer != undefined
                && this.currentSong.composer != null
                && this.currentSong.composer != ""
                && this.currentSong.artist != this.currentSong.composer) {              
                artistComposerString = `${this.currentSong.artist} (${this.currentSong.composer})`
            }
            
            let hasArtistComposerString = (artistComposerString
                && artistComposerString != undefined
                && artistComposerString != null
                && artistComposerString != "");
            let artistComposerDiv = hasArtistComposerString ? `<div><h2>${artistComposerString}</h2></div>` : ``;

            let hasTitle = (this.currentSong.title
                && this.currentSong.title != undefined
                && this.currentSong.title != null
                && this.currentSong.title != "");
            let titleDiv = hasTitle ? `<div><h1>"${this.currentSong.title}"</h1></div>` : ``;
            
            let hasLearnedFor = (this.currentSong.suggestedBy
                && this.currentSong.suggestedBy != undefined
                && this.currentSong.suggestedBy != null
                && this.currentSong.suggestedBy != ""
                && this.currentSong.suggestedBy != "drearyworlds");
            hasLearnedFor = false;
            let learnedForDiv = hasLearnedFor ? `<div><h3>${"Learned for "  + this.currentSong.suggestedBy}</h3></div>` : ``;

            let hasRequestedBy = (this.currentSong.requestedBy
                && this.currentSong.requestedBy != undefined
                && this.currentSong.requestedBy != null
                && this.currentSong.requestedBy != ""
                && this.currentSong.requestedBy != "drearyworlds");
            let requestedByDiv = hasRequestedBy ? `<div><h3>${"Requested by " + this.currentSong.requestedBy}</h3></div>` : ``;

            let hasYear = (this.currentSong.year
                && this.currentSong.year != undefined
                && this.currentSong.year != null);
            let yearString = hasYear ? `(${this.currentSong.year})` : ``;

            let hasAlbum = (this.currentSong.album
                && this.currentSong.album != undefined
                && this.currentSong.album != null
                && this.currentSong.album != ""
                && this.currentSong.album != "Unreleased");

            let albumDiv = hasAlbum ? `<div><h2>${this.currentSong.album} ${yearString}</h2></div>` : ``;
            
            return `
                <!DOCTYPE HTML>
                <html>
                    <meta http-equiv="refresh" content="8">
                    <body>
                        <div>
                            <h3>Current Song</h3>
                        </div>
                        ${artistComposerDiv}
                        ${titleDiv}
                        ${albumDiv}
                        ${learnedForDiv}
                        ${requestedByDiv}
                    </body>
                </html>
            `;
        } else {
            return `
                <!DOCTYPE HTML>
                <html>
                    <meta http-equiv="refresh" content="1">
                    <body></body>
                </html>
            `;
        }
    }

    async updateOrInsertSong(song: Song): Promise<boolean> {
        const methodName = this.updateOrInsertSong.name;

        this.log(LogLevel.Verbose, "Merging song: ", methodName);

        let ssSong: SsSong = this.mergeSong(song);
        let mergeSuccess = (ssSong != null) && (ssSong.id != 0);

        this.log(LogLevel.Verbose, `Merge success: ${mergeSuccess}`, methodName);
        this.log(LogLevel.Verbose, `ssSong: ${JSON.stringify(ssSong)}`, methodName);

        let dbSuccess = await SongRepository.updateOrInsertSong(song)
        let ssSuccess = false;

        if (mergeSuccess) {
            // Update it on SS
            ssSuccess = await this.updateStreamerSonglistSong(ssSong);
        } else {
            // Song was not matched as existing in SS list
            // Add it only if it is active (being changed to active)
            if (song.active) {
                // Create a new SsSong
                ssSong = new SsSong();
                this.log(LogLevel.Verbose, "Creating new SsSong", methodName)

                this.setSsSongFieldsFromSong(ssSong, song);

                // Add it to SS
                ssSuccess = await this.insertStreamerSonglistSong(ssSong);
            } else {
                // We didn't add it because it was inactive, but we successfully didn't add it
                ssSuccess = true;
            }
        }

        // Return the combined success
        return dbSuccess && ssSuccess;
    }

    private async updateStreamerSonglistSong(ssSong: SsSong): Promise<boolean> {
        const methodName = this.updateStreamerSonglistSong.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_SONGS_UPDATE;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());
        urlString = urlString.replace(/{songId}/g, ssSong.id.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            },
            body: JSON.stringify(ssSong)
        })
        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        this.log(LogLevel.Info, `responseJson: ${JSON.stringify(responseJson)}`, methodName);

        if (!response.ok) {
            return false;
        }

        return true;
    }

    private async insertStreamerSonglistSong(ssSong: SsSong): Promise<boolean> {
        const methodName = this.insertStreamerSonglistSong.name;
        const streamerId = Configuration.getStreamerId()
        this.log(LogLevel.Info, `streamerId: ${streamerId}`, methodName);

        let urlString = Constants.URL_SS_SONGS;
        urlString = urlString.replace(/{streamerId}/g, streamerId.toString());

        const url: URL = new URL(urlString);
        this.log(LogLevel.Info, `url: ${url.toString()}`, methodName);

        const token = Configuration.getStreamerSonglistToken()

        const ssSongJson = JSON.stringify(ssSong)
        this.log(LogLevel.Verbose, `ssSongJson: ${ssSongJson}`, methodName);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': "troubadour-server"
            },
            body: ssSongJson
        });

        this.log(LogLevel.Info, `response.ok: ${response.ok}`, methodName);

        const responseJson = await response.json();

        this.log(LogLevel.Info, `responseJson: ${JSON.stringify(responseJson)}`, methodName);

        if (!response.ok) {
            return false;
        }

        return true;
    }

    private log(logLevel: LogLevel, message: string, methodName: string) {
        LogService.log(logLevel, message, this.constructor.name, methodName)
    }
}

export default SongService.getInstance();