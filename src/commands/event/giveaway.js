const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Command not implemented"),
    hasField: {
        key: "role",
        value: "admin",
    },
    async execute(interaction) {
        await interaction.reply("Command not implemented");
    },
};
