import fs from "fs";
import mongoose from "mongoose";
import Configuration from "../config/Configuration"

class DatabaseManager {
    private static instance: DatabaseManager;

    constructor() {
        console.log("Created new instance of DatabaseManager");
    }

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async connectToDatabase() {
        console.log("connectToDatabase")
        const dbConnectionString = Configuration.getDatabaseConnectionString();
        console.log(dbConnectionString)

        await mongoose.connect(dbConnectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }).then(()=> {
            console.log("Connected to database");
        });

        return mongoose.connection;
    }
}

export default DatabaseManager.getInstance();
