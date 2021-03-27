import fs from "fs";

class Configuration {
    private static instance: Configuration;
    private static configFileName = 'config.json'
    private databaseConnectionString?: string;
    private streamerId?: string;
    private streamerSonglistToken?: string;

    constructor() {
        console.log('Created new instance of Configuration');
    }

    public initialize(userDataPath: string) {
        const configFileFullPath = `${userDataPath}\\${Configuration.configFileName}`
        const configFileCurrentDirectory = `${Configuration.configFileName}`

        // Load config file only if it exists
        if (fs.existsSync(configFileFullPath)) {
            console.log(`Found config.json at: ${configFileFullPath}`)
            let config = JSON.parse(fs.readFileSync(configFileFullPath).toString());
            this.databaseConnectionString = config.databaseConnectionString;
            this.streamerId = config.streamerId;
            this.streamerSonglistToken = config.streamerSonglistToken;
        } else if (fs.existsSync(configFileCurrentDirectory)) {
            console.log(`Found config.json at: ${configFileCurrentDirectory}`)
            let config = JSON.parse(fs.readFileSync(configFileCurrentDirectory).toString());
            this.databaseConnectionString = config.databaseConnectionString;
            this.streamerId = config.streamerId;
            this.streamerSonglistToken = config.streamerSonglistToken;
        } else {
            console.log(`configFileFullPath: ${configFileFullPath}`)
            console.log(`configFileCurrentDirectory: ${configFileCurrentDirectory}`)
            console.log("Cannot find config.json!")
        }
    }

    public static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    public getDatabaseConnectionString() {
        return this.databaseConnectionString;
    }

    public getStreamerId() {
        return this.streamerId;
    }

    public getStreamerSonglistToken() {
        return this.streamerSonglistToken;
    }
}

export default Configuration.getInstance();