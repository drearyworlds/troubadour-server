import tmi from "tmi.js"
import { Constants } from "./constants"
import Configuration from "../config/Configuration"

export class SanchezBot {
    // The client that connects to Twitch
    static client: tmi;

    static musicStream: boolean = false

    static predefinedCommands: Map<string, string> = new Map<string, string>();
    static calculatedCommands: Array<string> = new Array<string>();
    static sanchezCommandMessages: Array<string> = new Array<string>();


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

        SanchezBot.predefinedCommands.forEach((message: string, command: string) => {
            if (firstCommand) {
                firstCommand = false;
            } else {
                commandList += ", ";
            }

            console.log(`Adding ${command} to commandList`)
            commandList += command;
        });

        SanchezBot.calculatedCommands.forEach((command: string) => {
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

        SanchezBot.predefinedCommands.set("!juliette", "Mi hermana. She will sit sometimes. Or sing sometimes. Or pick me up when I am sleeping.");
        SanchezBot.predefinedCommands.set("!megan", "@meganeggncheese is Mami. She is a good mod, like I am a good boy. Gracias for supporting Papi and his stream.");
        SanchezBot.predefinedCommands.set("!discord", "Join the Other Dreary Worlds Discord to connect outside of stream. You can suggest songs, games, and drinks, view pictures of me and maybe other puppers, too. https://discord.gg/afmvH6W.");

        if (SanchezBot.musicStream) {
            SanchezBot.predefinedCommands.set("!songrequest", `To request a song, you will type "!sr song title", like "!sr Calle Ocho", or go to this link to browse the list, yes: https://www.streamersonglist.com/t/drearyworlds/songs.`);
        } else {
            SanchezBot.predefinedCommands.set("!minecraft", "To play along on Drearyland, join the Other Dreary Worlds Discord server! https://discord.gg/afmvH6W. Choose the games role in the #get-roles channel, then head to the #how-to-join channel for rules and instructions!");
        }

        SanchezBot.calculatedCommands.push("!dice")
        SanchezBot.calculatedCommands.push("!sanchez")

        let commandList: string = SanchezBot.getCommandList();
        SanchezBot.predefinedCommands.set("!commands", `Here are the commands you will give to me: ${commandList}. `);

        // Random Sanchez thoughts
        SanchezBot.sanchezCommandMessages.push("Zzzzzzzzzzzzzz....  burritos.....zzz.. tacos..... you will do this for me..... zzzz...");
        SanchezBot.sanchezCommandMessages.push("I like tacos and burritos. You will make me some. You will do this for me.");
        SanchezBot.sanchezCommandMessages.push("I am Sanchez.");
        SanchezBot.sanchezCommandMessages.push("I am truly The Chosen Sanchez.");
        SanchezBot.sanchezCommandMessages.push("Calle Ocho is my favorite song. You will play this for me.");
        SanchezBot.sanchezCommandMessages.push("Yo quiero Taco Bell...");
        SanchezBot.sanchezCommandMessages.push("You will follow papi.. You will press the heart icon to do this, yes.");
        SanchezBot.sanchezCommandMessages.push("You will subscribe to papi. You will do this for me.");
        SanchezBot.sanchezCommandMessages.push("I like to play with my squeaky carrot sometimes. I will not play unless I want to.");
        SanchezBot.sanchezCommandMessages.push("Is it 5:30 yet? 5:30 is dinner time.")
        SanchezBot.sanchezCommandMessages.push("Was that the doorbell?! I will protect you! *bark!* *bark!* *bark!*")
        SanchezBot.sanchezCommandMessages.push("Stop waking me up with this music, papi.. I am taking a siesta.")

    }

    initialize() {
        console.log("initialize")

        SanchezBot.calculateStreamType();
        SanchezBot.initializeMessages();

        // Define configuration options
        const opts = {
            identity: {
                username: Configuration.getTwitchBotUsername(),
                password: Configuration.getTwitchBotToken()
            },
            channels: [
                Configuration.getTwitchChannelName()
            ]
        };

        console.log("****************************************")
        console.log(Configuration.getTwitchBotUsername())
        console.log(Configuration.getTwitchBotToken())
        console.log(Configuration.getTwitchChannelName())
        console.log("****************************************")

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

    static executePredefinedCommand(commandName: string) {
        console.log(`executePredefinedCommand ${commandName}`)

        try {
            let commandText: string = `${SanchezBot.predefinedCommands.get(commandName)} I am Sanchez.`
            SanchezBot.client.say(Configuration.getTwitchChannelName(), commandText)
            return true;
        } catch (e) {
            console.error(`Caught an exception running predefined command ${commandName}: ${e} `)
        }

        return false;
    }

    static executeCalculatedCommand(commandName: string) {
        console.log("executeCalculatedCommand")

        try {
            if (commandName == "!dice") {
                SanchezBot.client.say(Configuration.getTwitchChannelName(), `${SanchezBot.getDiceCommand()} I am Sanchez.`);
                return true;
            } else if (commandName == "!sanchez") {
                SanchezBot.client.say(Configuration.getTwitchChannelName(), `${SanchezBot.getSanchezCommand()}`);
            }
        } catch (e) {
            console.error(`Caught an exeption running calculated command ${commandName} : ${e} `)
        }

        return false;
    }

    static handleCommand(target: string, commandName: string) {
        console.log(`handleCommand: ${commandName} `)

        let executed: boolean = false;

        if (SanchezBot.predefinedCommands.has(commandName)) {
            executed = SanchezBot.executePredefinedCommand(commandName)
        } else {
            executed = SanchezBot.executeCalculatedCommand(commandName)
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
        return `You rolled a ${die1} and a ${die2}. That is ${die1 + die2}.`;
    }

    static getSanchezCommand() {
        let randomIndex = Math.floor((Math.random() * SanchezBot.sanchezCommandMessages.length));
        console.log(`Random index: ${randomIndex}`)
        return SanchezBot.sanchezCommandMessages[randomIndex];
    }

    static setUpCommonIntervalCommands() {
        console.log("setUpCommonIntervalCommands")

        setInterval(() => {
            SanchezBot.executeCalculatedCommand("!sanchez")
        }, Constants.ONE_HOUR_IN_MS)

        setInterval(() => {
            SanchezBot.executePredefinedCommand("!discord")
        }, Constants.THIRTY_ONE_MINUTES_IN_MS)
    }

    static setUpGameStreamIntervalCommands() {
        console.log("setUpGameStreamIntervalCommands")

        setInterval(() => {
            SanchezBot.executePredefinedCommand("!minecraft")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }

    static setUpMusicStreamIntervalCommands() {
        console.log("setUpMusicStreamIntervalCommands")

        setInterval(() => {
            SanchezBot.executePredefinedCommand("!songrequest")
        }, Constants.TWENTY_NINE_MINUTES_IN_MS)
    }
}