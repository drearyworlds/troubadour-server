import dotenv from "dotenv"
import tmi from "tmi.js"
import { Constants } from "./constants"

export class SanchezBot {
    // The client that connects to Twitch
    client: tmi;

    musicStream: boolean = false

    static commands: Map<string, string>;

    constructor() {
    }

    calculateStreamType() {
        const dayOfWeek = new Date().getDay();

        if (dayOfWeek == Constants.SATURDAY) {
            this.musicStream = true;
        } else if (dayOfWeek == Constants.MONDAY) {
            this.musicStream = false;
        } else {
            console.error("WARNING!!! NOT MONDAY OR SATURDAY. ASSUMING GAME STREAM. ENSURE CORRECT STREAM TYPE!")
            this.musicStream = false;
        }
    }

    initializeMessage() {
        SanchezBot.commands["!juliette"] = "Mi hermana. She will sit sometimes. Or sing sometimes. Or pick me up when I am sleeping.";
        SanchezBot.commands["!megan"] = "@meganeggncheese is Mami. She is a good mod, like I am a good boy. Gracias for supporting Papi and his stream.";
        SanchezBot.commands["!sanchez"] = "I am Sanchez. Why did you invoke my command? I am likely taking a nap. You do not wake me.";

        SanchezBot.commands["!siesta"] = "Zzzzzzzzzzzzzz....";
        SanchezBot.commands["!taco"] = "I mostly eat burritos. You will make me one"
        SanchezBot.commands["!iAmSanchez"] = "I am Sanchez.";
        SanchezBot.commands["!discord"] = "Join the Other Dreary Worlds Discord to connect outside of stream. You can suggest songs, games, and drinks, view pictures of me and maybe other puppers, too. https://discord.gg/afmvH6W.";

        if (this.musicStream) {
            SanchezBot.commands["!songRequest"] = "To request a song, type !sr [song title], or go to this link to browse the list, yes: https://www.streamersonglist.com/t/drearyworlds/songs.";
        } else {
            SanchezBot.commands["!minecraft"] = "To play along on Drearyland, join the Other Dreary Worlds Discord server! https://discord.gg/afmvH6W. Choose the games role in the #get-roles channel, then head to the #how-to-join channel for rules and instructions!"
        }

        SanchezBot.commands["!commands"] = `${SanchezBot.commands["!sanchez"]} Here are the commands you will give to me: ${SanchezBot.commands.keys.toString()}`;
    }

    initialize() {
        this.calculateStreamType();
        this.initializeMessage();

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
        this.client = new tmi.client(opts);
        this.client.on('connected', this.onConnectedHandler);
        this.client.connect();
        this.client.on('message', this.onMessageHandler);

        this.setUpCommonIntervalCommands();

        if (this.musicStream) {
            this.setUpMusicStreamIntervalCommands();
        } else {
            this.setUpGameStreamIntervalCommands();
        }
    }

    // Called every time the bot connects to Twitch chat
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    executePredefinedCommand(target: string, commandName: string) {
        try {
            this.client.say(target, SanchezBot.commands[commandName])
            return true;
        } catch {
            console.log(`Exception running ${commandName} command`)
        }

        return false;
    }

    executeCalculatedCommand(target: string, commandName: string) {
        try {
            if (commandName == "!dice") {
                this.client.say(target, `${this.getDiceCommand()} ${SanchezBot.commands["!sanchez"]}`);
                return true;
            }
        } catch {
            console.log(`Exception running ${commandName} command`)
        }

        return false;
    }

    handleCommand(target: string, commandName: string) {
        let executed: boolean = false;

        let commandText = SanchezBot.commands[commandName];
        if (commandText != null) {
            executed = this.executePredefinedCommand(target, commandName)
        } else {
            executed = this.executeCalculatedCommand(target, commandName)
        }

        return executed;
    }

    // Called every time a message comes in
    onMessageHandler(target, context, message, self) {
        try {
            if (self) { return; } // Ignore messages from the bot

            // Remove whitespace from chat message
            const commandName = message.trim();
            let executed = false;

            if (commandName.startsWith("!")) {
                executed = this.handleCommand(target, commandName);

                if (executed) {
                    console.log(`* Executed ${commandName} command`);
                } else {
                    console.log(`* Failed to execute ${commandName} command`)
                }
            }
        } catch {
            console.log(`Caught an exception processing a message: ${message}`)
        }
    }

    // Function called when the "dice" command is issued
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    getDiceCommand() {
        const die1 = this.rollDie(6);
        const die2 = this.rollDie(6);
        return `You rolled a ${die1} and a ${die2}. That is ${die1 + die2}.`;
    }

    setUpCommonIntervalCommands() {
        setInterval(() => {
            this.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!sanchez")
        }, Constants.ONE_HOUR_IN_MS)

        setInterval(() => {
            this.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!discord")
        }, Constants.THIRTY_ONE_MINUTES_IN_MS)
    }

    setUpGameStreamIntervalCommands() {
        setInterval(() => {
            this.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!minecraft")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }

    setUpMusicStreamIntervalCommands() {
        setInterval(() => {
            this.executePredefinedCommand(process.env.TWITCH_CHANNEL_NAME, "!songrequest")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }
}