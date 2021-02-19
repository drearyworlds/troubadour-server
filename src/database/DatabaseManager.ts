import fs from "fs";
import mongoose from "mongoose";

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
        await mongoose.connect("mongodb://localhost/my_database", {
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
