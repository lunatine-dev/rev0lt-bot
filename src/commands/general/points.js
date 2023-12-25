const User = require("../../models/User");
const { SlashCommandBuilder } = require("discord.js");

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
                avatar: interaction.user.avatarURL({
                    size: 256,
                }),
                points: 0,
            }).save();
        }

        let points = user.points || 0;

        await interaction.editReply(`You currently have \`${points}\` points`);
    },
};
