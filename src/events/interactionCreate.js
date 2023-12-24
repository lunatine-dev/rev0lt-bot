const User = require("../models/User");

module.exports = async (client, interaction) => {
    let command;

    if (interaction.isChatInputCommand()) {
        command = client.commands.get(interaction.commandName);
    }

    if (!command)
        return interaction.reply({
            content: `This command is not available.`,
            ephemeral: true,
        });

    try {
        //database field
        if (command.hasField) {
            let { key, value } = command.hasField;

            if (!key || !value)
                return interaction.reply({
                    content: "Permission error",
                    ephemeral: true,
                });

            let user = await User.findOne({
                identifier: interaction.user.id,
            });

            if (!user) {
                user = await new User({
                    identifier: interaction.user.id,
                    username: interaction.user.username,
                    avatar: interaction.user.avatarURL({
                        size: 256,
                    }),
                    points: 0,
                }).save();
            }

            if (!user[key] || user[key] !== value)
                return interaction.reply({
                    content: "You do not have permission to run this command",
                    ephemeral: true,
                });
        }

        if (command.dev) {
            if (process.env?.DEVELOPER_ID !== interaction.user.id)
                return interaction.reply({
                    content: "This command is only available to developers.",
                    ephemeral: true,
                });
        }

        await command.execute(interaction);
    } catch (e) {
        console.error(e);
        await interaction.reply({
            content: "There was an error running this command",
            ephemeral: true,
        });
    }
};
