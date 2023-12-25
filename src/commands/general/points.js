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

        await interaction.editReply(`You currently have \`${points}\` points`);
    },
};
