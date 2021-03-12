import dotenv from "dotenv"
import tmi from "tmi.js"
import { Constants } from "./constants"

export class SanchezBot {
    // The client that connects to Twitch
    static client: tmi;

    static musicStream: boolean = false

    static commands: Map<string, string> = new Map<string, string>();

    constructor() {
        console.log("constructor")
    }

    static calculateStreamType() {
        console.log("calculateStreamType")

        const dayOfWeek = new Date().getDay();

        if (dayOfWeek == Constants.SATURDAY) {
            SanchezBot.musicStream = true;
        } else if (dayOfWeek == Constants.MONDAY) {
            SanchezBot.musicStream = false;
        } else {
            console.error("WARNING!!! NOT MONDAY OR SATURDAY. ASSUMING GAME STREAM. ENSURE CORRECT STREAM TYPE!")
            SanchezBot.musicStream = false;
        }
    }

    static getCommandList() {
        console.log("getCommandList")

        let commandList: string = "";
        let firstCommand: boolean = true;

        SanchezBot.commands.forEach((message: string, command: string) => {
            if (firstCommand) {
                firstCommand = false;
            } else {
                commandList += ", ";
            }

            console.log(`Adding ${command} to commandList`)
            commandList += command;
        });

        console.log(`Returning: ${commandList} `)
        return commandList;
    }

    static initializeMessages() {
        console.log("initializeMessages")

        SanchezBot.commands.set("!juliette", "Mi hermana. She will sit sometimes. Or sing sometimes. Or pick me up when I am sleeping.");
        SanchezBot.commands.set("!megan", "@meganeggncheese is Mami. She is a good mod, like I am a good boy. Gracias for supporting Papi and his stream.");
        SanchezBot.commands.set("!siesta", "Zzzzzzzzzzzzzz....");
        SanchezBot.commands.set("!taco", "I mostly eat burritos. You will make me one");
        SanchezBot.commands.set("!sanchez", "I am Sanchez.");
        SanchezBot.commands.set("!discord", "Join the Other Dreary Worlds Discord to connect outside of stream. You can suggest songs, games, and drinks, view pictures of me and maybe other puppers, too. https://discord.gg/afmvH6W.");

        if (SanchezBot.musicStream) {
            SanchezBot.commands.set("!songRequest", "To request a song, type !sr .set(song title], or go to this link to browse the list, yes: https://www.streamersonglist.com/t/drearyworlds/songs.");
        } else {
            SanchezBot.commands.set("!minecraft", "To play along on Drearyland, join the Other Dreary Worlds Discord server! https://discord.gg/afmvH6W. Choose the games role in the #get-roles channel, then head to the #how-to-join channel for rules and instructions!");
        }

        let commandList: string = SanchezBot.getCommandList();
        SanchezBot.commands.set("!commands", `${SanchezBot.commands.get("!sanchez")} Here are the commands you will give to me: ${commandList} `);
    }

    initialize() {
        console.log("initialize")

        SanchezBot.calculateStreamType();
        SanchezBot.initializeMessages();

        dotenv.config()

        // Define configuration options
        const opts = {
            identity: {
                username: process.env.TWITCH_BOT_USERNAME,
                password: process.env.TWITCH_BOT_TOKEN
            },
            channels: [
                process.env.TWITCH_CHANNEL_NAME
            ]
        };

        // Create a client with our options
        SanchezBot.client = new tmi.client(opts);
        SanchezBot.client.on('connected', SanchezBot.onConnectedHandler);
        SanchezBot.client.connect();
        SanchezBot.client.on('message', SanchezBot.onMessageHandler);

        SanchezBot.setUpCommonIntervalCommands();

        if (SanchezBot.musicStream) {
            SanchezBot.setUpMusicStreamIntervalCommands();
        } else {
            SanchezBot.setUpGameStreamIntervalCommands();
        }
    }

    // Called every time the bot connects to Twitch chat
    static onConnectedHandler(addr, port) {
        console.log(`Connected to ${addr}: ${port} `);
    }

    static executePredefinedCommand(target: any, commandName: string) {
        console.log("executePredefinedCommand")

        try {
            SanchezBot.client.say(target, SanchezBot.commands.get(commandName))
            return true;
        } catch (e) {
            console.error(`Caught an exception running predefined command ${commandName}: ${e} `)
        }

        return false;
    }

    static executeCalculatedCommand(target: any, commandName: string) {
        console.log("executeCalculatedCommand")

        try {
            if (commandName == "!dice") {
                SanchezBot.client.say(target, `${SanchezBot.getDiceCommand()} ${SanchezBot.commands.get("!sanchez")} `);
                return true;
            }
        } catch (e) {
            console.error(`Caught an exeption running calculated command ${commandName} : ${e} `)
        }

        return false;
    }

    static handleCommand(target: any, commandName: any) {
        console.log(`handleCommand: ${commandName} `)

        let executed: boolean = false;

        if (SanchezBot.commands.has(commandName)) {
            executed = SanchezBot.executePredefinedCommand(target, commandName)
        } else {
            executed = SanchezBot.executeCalculatedCommand(target, commandName)
        }

        return executed;
    }

    // Called every time a message comes in
    static onMessageHandler(target, context, message, self) {
        try {
            if (self) { return; } // Ignore messages from the bot

            // Remove whitespace from chat message
            const commandName = message.trim();
            let executed = false;

            if (commandName.startsWith("!")) {
                console.log("commandName startsWith !");
                executed = SanchezBot.handleCommand(target, commandName);

                if (executed) {
                    console.log(`Executed ${commandName} command`);
                } else {
                    console.error(`Failed to execute ${commandName} command`)
                }
            }
        } catch (e) {
            console.error(`Caught an exception processing a message: ${message}: ${e} `)
        }
    }

    // Function called when the "dice" command is issued
    static rollDie(sides) {
        console.log("rollDie");

        return Math.floor(Math.random() * sides) + 1;
    }

    static getDiceCommand() {
        console.log("getDiceCommand");

        const die1 = SanchezBot.rollDie(6);
        const die2 = SanchezBot.rollDie(6);
        return `You rolled a ${die1} and a ${die2}.That is ${die1 + die2}.`;
    }

    static setUpCommonIntervalCommands() {
        console.log("setUpCommonIntervalCommands")

        setInterval(() => {
            SanchezBot.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!sanchez")
        }, Constants.ONE_HOUR_IN_MS)

        setInterval(() => {
            SanchezBot.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!discord")
        }, Constants.THIRTY_ONE_MINUTES_IN_MS)
    }

    static setUpGameStreamIntervalCommands() {
        console.log("setUpGameStreamIntervalCommands")

        setInterval(() => {
            SanchezBot.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!minecraft")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }

    static setUpMusicStreamIntervalCommands() {
        console.log("setUpMusicStreamIntervalCommands")

        setInterval(() => {
            SanchezBot.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!songrequest")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }
}