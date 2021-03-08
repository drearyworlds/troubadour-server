import dotenv from "dotenv"
import tmi from "tmi.js"
import { Constants } from "./constants"

const discordMessage = "Join the Other Dreary Worlds Discord to connect outside of stream. You can suggest songs and drinks, view pictures of me and maybe other puppers, too. https://discord.gg/afmvH6W";
const iAmSanchezMessage = "I am Sanchez.";
const julietteMessage = "Mi hermana and la hija de papá. She will sit sometimes. Or sing sometimes. Or pick me up when I am sleeping.";
const meganMessage = "@meganeggncheese is my Mami. She is also a good mod, like I am a good boy. Gracias for supporting Papi and his stream.";
const sanchezMessage = "I am Sanchez. Why did you invoke my command? I am likely taking a nap. You do not wake me.";
const siestaMessage = "Zzzzzzzzzzzzzz....";
const tacoMessage = "I mostly eat burritos. You will make me one."

const songRequestMessage = "To request a song for Papi to sing, type !sr [song title], or go to this link to browse the list, yes: https://www.streamersonglist.com/t/drearyworlds/songs";

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
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    try {
        if (self) { return; } // Ignore messages from the bot

        // Remove whitespace from chat message
        const commandName = msg.trim();
        let executed = false;

        if (commandName.startsWith("!")) {
            switch (commandName) {
                // If the command is known, let's execute it
                case "!dice":
                    const num = rollDice(2, 6);
                    client.say(target, `You rolled ${num}. ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                case '!taco':
                    client.say(target, `${tacoMessage} ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                case '!siesta':
                    client.say(target, `${siestaMessage}`);
                    executed = true;
                    break;
                case '!discord':
                    client.say(target, `${discordMessage} ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                case '!juliette':
                    client.say(target, `${julietteMessage} ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                case '!megan':
                    client.say(target, `${meganMessage} ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                case '!sanchez':
                    client.say(target, `${sanchezMessage}`);
                    executed = true;
                    break;
                case '!songrequest':
                    client.say(target, `${songRequestMessage} ${iAmSanchezMessage}`);
                    executed = true;
                    break;
                default:
                    console.log(`* Unknown command ${commandName}`);
                    break;
            }
        }

        if (executed) {
            console.log(`* Executed ${commandName} command`);
        }
    } catch {
        console.log('caught an exception processing a message')
    }
}

// Function called when the "dice" command is issued
function rollDice(number, sidesPerDie) {
    let total = 0;
    for (let num = 0; num < number; num++) {
        total += rollDie(sidesPerDie);
    }
    return total;
}

// Function called when the "dice" command is issued
function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

setInterval(() => {
    try {
        client.say(process.env.TWITCH_CHANNEL_NAME, iAmSanchezMessage);
        console.log(`* Executed iAmSanchez command`);
    } catch {
        console.log("Exception running iAmSanchez command")
    }
}, Constants.ONE_HOUR_IN_MS)

setInterval(() => {
    try {
        client.say(process.env.TWITCH_CHANNEL_NAME, discordMessage);
        console.log(`* Executed discord command`);
    } catch {
        console.log("Exception running discord command")
    }
}, Constants.THIRTY_ONE_MINUTES_IN_MS)

setInterval(() => {
    try {
        client.say(process.env.TWITCH_CHANNEL_NAME, songRequestMessage);
        console.log(`* Executed songRequest command`);
    } catch {
        console.log("Exception running discord command")
    }
}, Constants.TWENTY_NINE_MINUTES_IN_MS)
