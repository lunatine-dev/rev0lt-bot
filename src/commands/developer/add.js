const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin a user")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("ID of the user")
                .setRequired(true)
        ),
    async execute(interaction) {
        const id = interaction.options.getString("id");

        let user = await User.findOne({
            identifier: id,
        });

        if (!user)
            return await interaction.reply({
                content: "User does not exist",
                ephemeral: true,
            });

        user.role = "admin";

        await user.save();

        await interaction.reply({
            content: "User now has the admin role",
            ephemeral: true,
        });
    },
};
