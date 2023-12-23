require("dotenv").config();

require("./helpers/check-env")(["CLIENT_TOKEN", "MONGO_URI"]);

//packages
const fs = require("fs"),
    path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js"),
    mongoose = require("mongoose");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

require("./helpers/log")(client);

client.commands = new Collection();

require("./helpers/load")(client);

(async () => {
    client.log("Connecting to database", "red");
    await mongoose.connect(process.env.MONGO_URI);
    client.log("Connected to database", "green");

    client.log("Deploying commands", "red");
    await require("./deploy");
    client.log("Deployed commands", "green");

    client.login(process.env.CLIENT_TOKEN);
})();
