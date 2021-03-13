import fs from "fs";

class Configuration {
    private static instance: Configuration;
    private databaseConnectionString?: string;

    constructor() {
        console.log('Created new instance of Configuration');

        // Load config file only if it exists
        if (fs.existsSync("config.json")) {
            let config = JSON.parse(fs.readFileSync("config.json").toString());
            this.databaseConnectionString = config.databaseConnectionString;
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
}

export default Configuration.getInstance();