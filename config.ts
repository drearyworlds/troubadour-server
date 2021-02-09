import fs from "fs";

export class Configuration {
    private dataPath: string = "./data/";
    private lyricsExtension: string = ".txt";

    constructor() {
        // Load config file only if it exists
        if (fs.existsSync("config.json")) {
            let config = JSON.parse(fs.readFileSync("config.json").toString());
            this.dataPath = config.dataPath;
            this.lyricsExtension = config.lyricsExtension;
        }
    }

    public getDataPath(): string {
        return this.dataPath;
    }

    public getLyricsExtension(): string {
        return this.lyricsExtension;
    }
}