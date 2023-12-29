const { SlashCommandBuilder } = require("discord.js");

const Giveaway = require("../../models/Giveaway");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edits a giveaway")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription(
                    "ID of the giveaway (can be found in giveaway footer)"
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("New description of the giveaway")
        )
        .addStringOption((option) =>
            option.setName("date").setDescription("New date for giveaway")
        ),
    hasField: {
        key: "role",
        value: "admin",
    },
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        //TODO: Update message when giveaway is updated
        const id = interaction.options.getString("id");
        const description = interaction.options.getString("description");
        const date = interaction.options.getString("date");

        //both can't be missing
        if (!date && !description)
            return await interaction.editReply(
                "Sorry, but you need to include at least one field to edit"
            );

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

        if (date) {
            const d = interaction.client.parseDate(date);
            if (!d) return await interaction.editReply("Invalid date");
            giveaway.deadline = d;
        }
        if (description) {
            giveaway.title = description;
        }

        await giveaway.save();

        await interaction.editReply(`Successfully updated giveaway`);
    },
};
