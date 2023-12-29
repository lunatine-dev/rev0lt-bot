const { SlashCommandBuilder } = require("discord.js");

const Giveaway = require("../../models/Giveaway");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Deletes a giveaway")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription(
                    "ID of the giveaway (can be found in giveaway footer)"
                )
                .setRequired(true)
        ),
    hasField: {
        key: "role",
        value: "admin",
    },
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const id = interaction.options.getString("id");

        let giveaway;
        try {
            giveaway = await Giveaway.findById(id);
        } catch (e) {
            return await interaction.editReply(
                "Failed to find a giveaway with the ID"
            );
        }

        if (!giveaway)
            return await interaction.editReply(
                "Failed to find a giveaway with the ID"
            );

        //attempt to delete message
        try {
            const channel = await interaction.guild.channels.fetch(
                process.env.GIVEAWAY_CHANNEL
            );

            if (channel) {
                const message = await channel.messages.fetch(giveaway.message);

                if (message) {
                    await message.delete();
                }
            }
        } catch (e) {
            console.error(e);
        }

        //attempt to delte from database
        await Giveaway.findByIdAndDelete(id);

        await interaction.editReply("Successfully deleted giveaway");
    },
};
