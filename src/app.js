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
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.GuildMember,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
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

    try {
        const expiredPosts = await client.getExpiredPosts();

        for (const post of expiredPosts) {
            await client.processPost(post);
        }
    } catch (e) {
        console.error(e);
    }
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
