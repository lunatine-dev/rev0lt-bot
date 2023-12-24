const fs = require("fs"),
    path = require("path"),
    { Routes, REST } = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const client_id = process.env.CLIENT_ID;
const token = process.env.CLIENT_TOKEN;
const dev_guild = process.env.DEV_GUILD;
const active_guild = process.env.ACTIVE_GUILD_ID;

const globalCommands = [];
const guilds = {};

const commandsPath = path.join(__dirname, "commands");

const rest = new REST().setToken(token);

for (const category of fs.readdirSync(commandsPath)) {
    for (const file of fs.readdirSync(path.join(commandsPath, category))) {
        const command = require(path.join(commandsPath, category, file));
        if (command.guild) {
            if (!guilds[command.guild]) guilds[command.guild] = [];
            guilds[command.guild].push(command.data.toJSON());
        } else {
            if (category === "developer") {
                if (!guilds[dev_guild]) guilds[dev_guild] = [];
                guilds[dev_guild].push(command.data.toJSON());
            } else {
                // globalCommands.push(command.data.toJSON());
                if (!guilds[active_guild]) guilds[active_guild] = [];
                guilds[active_guild].push(command.data.toJSON());
            }
        }
    }
}

const deployGlobal = async (token, id) => {
    try {
        console.log(`Deploying ${globalCommands.length} global commands...`);
        const data = await rest.put(Routes.applicationCommands(client_id), {
            body: globalCommands,
        });
        console.log(`Deployed ${data.length} global commands.`);
    } catch (e) {
        console.error(e);
    }
};
const deployGuilds = async () => {
    try {
        for (const guildId in guilds) {
            console.log(
                `Deploying ${guilds[guildId].length} guild commands for guild ${guildId}...`
            );
            const data = await rest.put(
                Routes.applicationGuildCommands(client_id, guildId),
                {
                    body: guilds[guildId],
                }
            );
            console.log(
                `Deployed ${data.length} guild command${
                    data.length === 1 ? "" : "s"
                }.`
            );
        }
    } catch (e) {
        console.error(e);
    }
};

const deleteCommands = async () => {
    try {
        console.log("Deleting global commands...");
        const data = await rest.get(Routes.applicationCommands(client_id));
        await Promise.all(
            data.map((command) =>
                rest.delete(Routes.applicationCommand(client_id, command.id))
            )
        );
        console.log("Deleted global commands.");
        for (const guildId in guilds) {
            console.log(`Deleting guild commands for guild ${guildId}...`);
            const data = await rest.get(
                Routes.applicationGuildCommands(client_id, guildId)
            );
            await Promise.all(
                data.map((command) =>
                    rest.delete(
                        Routes.applicationGuildCommand(
                            client_id,
                            guildId,
                            command.id
                        )
                    )
                )
            );
            console.log(`Deleted guild commands for guild ${guildId}.`);
        }
    } catch (e) {
        console.error(e);
    }
};

module.exports = async (deleteC) => {
    await deployGlobal();
    await deployGuilds();

    if (deleteC) await deleteCommands();
};
