const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set_points")
        .setDescription("Sets a users points")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User to set points")
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("amount")
                .setDescription("Amount to set")
                .setMinValue(0)
                .setRequired(true)
        ),
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const amount = interaction.options.getNumber("amount");
        const user = interaction.options.getUser("user");

        await User.findOneAndUpdate(
            {
                identifier: user.id,
            },
            {
                $set: {
                    points: amount,
                    total_points: amount,
                },
            }
        );

        await interaction.editReply(
            `Set \`${user.username}'s\` points to \`${amount}\``
        );
    },
};
