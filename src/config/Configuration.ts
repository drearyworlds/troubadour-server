import fs from "fs";

class Configuration {
    private static instance: Configuration;
    private databaseConnectionString?: string;
    private static configFileName = 'config.json'

    constructor() {
        console.log('Created new instance of Configuration');
    }

    public initialize(userDataPath: string) {
        const configFileFullPath = `${userDataPath}\\${Configuration.configFileName}`

        console.log(`configFileFullPath: ${configFileFullPath}`)

        // Load config file only if it exists
        if (fs.existsSync(configFileFullPath)) {
            let config = JSON.parse(fs.readFileSync(configFileFullPath).toString());
            this.databaseConnectionString = config.databaseConnectionString;
        } else {
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
}

export default Configuration.getInstance();