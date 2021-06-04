import fs from "fs";
import mongoose from "mongoose";
import Configuration from "../config/configuration-service"
import LogService from "../logging/log-service"
import { LogLevel } from "../logging/log-service"

class DatabaseManager {
    private static instance: DatabaseManager;

    constructor() {
        LogService.log(LogLevel.Info, "Created new instance of DatabaseManager");
    }

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async connectToDatabase() {
        LogService.log(LogLevel.Info, "connectToDatabase")
        const dbConnectionString = Configuration.getDatabaseConnectionString();
        LogService.log(LogLevel.Info, dbConnectionString)

        await mongoose.connect(dbConnectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }).then(()=> {
            LogService.log(LogLevel.Info, "Connected to database");
        });

        return mongoose.connection;
    }
}

export default DatabaseManager.getInstance();
