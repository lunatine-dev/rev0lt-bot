const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("toggle")
        .setDescription("Toggles a giveaways status")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("ID of the giveaway")
                .setRequired(true)
        )
        .addBooleanOption((option) =>
            option
                .setName("status")
                .setDescription("Status of giveaway")
                .setRequired(true)
        ),

    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const id = interaction.options.getString("id");
        const status = interaction.options.getBoolean("status");

        console.log(id, status);

        await interaction.client.giveawayStatus(id, status);

        await interaction.editReply({
            content: "Set giveaway to " + (status ? "active" : "inactive"),
            ephemeral: true,
        });
    },
};
