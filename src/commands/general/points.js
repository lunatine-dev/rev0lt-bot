const User = require("../../models/User");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("points")
        .setDescription("See how many points you have"),
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const id = interaction.user.id;

        let user = await User.findOne({
            identifier: id,
        });

        if (!user) {
            user = await new User({
                identifier: id,
                username: interaction.user.username,
                displayName: interaction.member.displayName,
                avatar: interaction.user.avatarURL({
                    size: 256,
                }),
                points: 0,
            }).save();
        } else {
            //update their info
            user.username = interaction.user.username;
            user.displayName = interaction.member.displayName;
            user.avatar = interaction.user.avatarURL({
                size: 256,
            });

            await user.save();
        }

        let points = user.points || 0;

        const embed = new EmbedBuilder()
            .setDescription(
                "Your **current** points will be reset if you win a giveaway, if you don't win they'll be kept for the next giveaway."
            )
            .addFields(
                {
                    name: "Current",
                    value: points.toString(),
                    inline: true,
                },
                {
                    name: "Total",
                    value: user.total_points.toString(),
                    inline: true,
                }
            );

        await interaction.editReply({
            embeds: [embed],
        });
    },
};
