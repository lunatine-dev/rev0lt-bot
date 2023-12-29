require("dotenv").config();

require("./helpers/check-env")([
    "CLIENT_ID",
    "CLIENT_TOKEN",
    "MONGO_URI",
    "GIVEAWAY_CHANNEL",
]);

//packages
const {
        Client,
        GatewayIntentBits,
        Collection,
        Partials,
    } = require("discord.js"),
    mongoose = require("mongoose");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
    ],
    partials: [Partials.GuildMember],
});

require("./helpers/log")(client);

client.commands = new Collection();
client.isLoggedIn = false;

require("./helpers/load")(client);

(async () => {
    client.log("Connecting to database", "red");
    await mongoose.connect(process.env.MONGO_URI);
    client.log("Connected to database", "green");

    client.log("Deploying commands", "red");
    await require("./deploy")();
    client.log("Deployed commands", "green");

    client.login(process.env.CLIENT_TOKEN);
})();

const cron = require("node-cron");

cron.schedule("* * * * *", async () => {
    if (!client.isLoggedIn) return;

    try {
        const expiredGiveaways = await client.getExpiredGiveaways();

        for (const giveaway of expiredGiveaways) {
            await client.processGiveaway(giveaway);
        }
    } catch (e) {
        console.error(e);
    }
});
