const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");
const Evidence = require("../../models/Evidence");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Resets yearly events"),
    async execute(interaction) {
        //loop users, reset "points" and "total_points" to 0
        let users = await User.find();
        users.forEach(async (user) => {
            user.points = 0;
            user.total_points = 0;
            await user.save();
        });

        //delete all evidence
        await Evidence.deleteMany();

        await interaction.reply({
            content: "Reset successful",
            ephemeral: true,
        });
    },
};
