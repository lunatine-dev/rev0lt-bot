const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("track")
        .setDescription("Adds / updates all users on database"),
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const guild = await interaction.client.guilds.fetch(
            process.env.ACTIVE_GUILD_ID
        );

        if (!guild) return await interaction.editReply("No guild found");

        const members = await guild.members.fetch();

        const actualPeople = members.filter((member) => !member.user.bot); //we don't want to track bots

        actualPeople.each(async (member) => {
            const user = await User.findOne({ identifier: member.id });

            if (!user) {
                //create new
                await new User({
                    identifier: member.id,
                    username: member.user.username,
                    displayName: member.displayName,
                    avatar: member.user.avatarURL({
                        size: 256,
                    }),
                    points: 0,
                    total_points: 0,
                }).save();
            } else {
                //update
                user.username = member.user.username;
                user.displayName = member.displayName;
                user.avatar = member.user.avatarURL({
                    size: 256,
                });

                await user.save();
            }
        });

        console.log("Saved all");

        await interaction.editReply("Successfully added all users");
    },
};
