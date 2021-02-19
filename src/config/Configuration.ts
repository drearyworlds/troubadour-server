import fs from "fs";

class Configuration {
    private static instance: Configuration;
    private dataPath: string = "./data/";
    private lyricsExtension: string = ".txt";

    constructor() {
        console.log('Created new instance of Configuration');

        // Load config file only if it exists
        if (fs.existsSync("config.json")) {
            let config = JSON.parse(fs.readFileSync("config.json").toString());
            this.dataPath = config.dataPath;
            this.lyricsExtension = config.lyricsExtension;
        }
    }

    static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    public getDataPath(): string {
        return this.dataPath;
    }

    public getLyricsExtension(): string {
        return this.lyricsExtension;
    }
}

export default Configuration.getInstance();