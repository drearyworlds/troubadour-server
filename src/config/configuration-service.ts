import fs from "fs";
import LogService from "../logging/log-service"

class Configuration {
    private static instance: Configuration;
    private static configFileName = 'config.json'
    private databaseConnectionString?: string;
    private streamerId: number;
    private streamerSonglistToken?: string;

    constructor() {
        LogService.log('Created new instance of Configuration');
    }

    public initialize(userDataPath: string) {
        LogService.log('Initializing Configuration');

        try {
            const configFileFullPath = `${userDataPath}\\${Configuration.configFileName}`
            const configFileCurrentDirectory = `${Configuration.configFileName}`

            // Load config file only if it exists
            if (fs.existsSync(configFileFullPath)) {
                LogService.log(`Found config.json at: ${configFileFullPath}`)
                let config = JSON.parse(fs.readFileSync(configFileFullPath).toString());
                this.databaseConnectionString = config.databaseConnectionString;
                this.streamerId = config.streamerId;
                this.streamerSonglistToken = config.streamerSonglistToken;
            } else if (fs.existsSync(configFileCurrentDirectory)) {
                LogService.log(`Found config.json at: ${configFileCurrentDirectory}`)
                let config = JSON.parse(fs.readFileSync(configFileCurrentDirectory).toString());
                this.databaseConnectionString = config.databaseConnectionString;
                this.streamerId = config.streamerId;
                this.streamerSonglistToken = config.streamerSonglistToken;
            } else {
                LogService.log(`configFileFullPath: ${configFileFullPath}`)
                LogService.log(`configFileCurrentDirectory: ${configFileCurrentDirectory}`)
                LogService.log("Cannot find config.json!")
            }
        } catch {
            console.error("Exception initalizing configuration!")
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