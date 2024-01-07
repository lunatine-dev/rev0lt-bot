const User = require("../models/User");
const {
    userMention,
    ActionRowBuilder,
    ButtonBuilder,
    time,
    ButtonStyle,
} = require("discord.js");

const Post = require("../models/Post");
const addPoint = "✅";
const removePoint = "❌";

module.exports = async (client, interaction) => {
    let command;

    if (interaction.isChatInputCommand()) {
        command = client.commands.get(interaction.commandName);

        if (!command)
            return interaction.reply({
                content: `This command is not available.`,
                ephemeral: true,
            });

        try {
            if (command.defer) {
                await interaction.deferReply({
                    ephemeral: command.defer?.ephemeral,
                });
            }
            //database field
            if (command.hasField) {
                let { key, value } = command.hasField;

                if (!key || !value)
                    return interaction.reply({
                        content: "Permission error",
                        ephemeral: true,
                    });

                if (!command.defer) {
                    await interaction.deferReply({
                        ephemeral: true,
                    });
                }

                let user = await User.findOne({
                    identifier: interaction.user.id,
                });

                if (!user) {
                    user = await new User({
                        identifier: interaction.user.id,
                        username: interaction.user.username,
                        avatar: interaction.user.displayAvatarURL({
                            size: 256,
                        }),
                        points: 0,
                    }).save();
                }

                if (!user[key] || user[key] !== value)
                    return interaction.editReply({
                        content:
                            "You do not have permission to run this command",
                        ephemeral: true,
                    });
            }

            if (command.dev || command.category === "developer") {
                if (process.env?.DEVELOPER_ID !== interaction.user.id)
                    return interaction.reply({
                        content:
                            "This command is only available to developers.",
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
    } else if (interaction.isButton()) {
        const { customId, message, user, member } = interaction;

        if (customId === "approve_evidence" || customId === "reject_evidence") {
            await interaction.deferReply({
                ephemeral: true,
            });

            //if person that clicked the button is not an admin, deny them
            try {
                const u = await User.findOne({
                    identifier: user.id,
                });

                if (!u || u.role !== "admin")
                    return await interaction.editReply(
                        "You do not have permission to do that."
                    );

                //user is admin, they can use the buttons
                const embed = message.embeds[0];
                const row = message.components[0];
                const [approveButton, rejectButton] = row.components;
                const approve = new ButtonBuilder()
                    .setCustomId("approve_evidence")
                    .setLabel("Approve")
                    .setStyle(ButtonStyle.Success);
                const reject = new ButtonBuilder()
                    .setCustomId("reject_evidence")
                    .setLabel("Reject")
                    .setStyle(ButtonStyle.Danger);

                const statusIndex = embed.fields.findIndex(
                    (field) => field.name === "Status:"
                );

                //let's get the user who submitted the evidence
                const id = embed.data.footer.text.trim();
                const submitterUser = await interaction.guild.members.fetch(id);

                if (!submitterUser)
                    return await interaction.editReply(
                        "Submitter does not exist. Did they leave the server?"
                    );

                let submitter = await User.findOne({ identifier: id });

                if (!submitter) {
                    //create them
                    submitter = await new User({
                        identifier: id,
                        username: submitterUser.user.username,
                        avatar: submitterUser.user.displayAvatarURL({
                            size: 256,
                        }),
                        points: 0,
                        total_points: 0,
                    }).save();
                }

                if (customId === "approve_evidence") {
                    //add a point
                    console.log(approveButton, submitter.evidence);
                    if (
                        approveButton.disabled ||
                        submitter.evidence.includes(message.id)
                    )
                        return await interaction.editReply(
                            "Point already given"
                        ); //disabled, ignore / already received point

                    //add point to user, if successful, disable button
                    submitter.points += 1;
                    submitter.total_points += 1;
                    submitter.evidence = [...submitter.evidence, message.id];

                    await submitter.save();

                    //edit message embed & buttons
                    approve.setDisabled(true);
                    reject.setDisabled(false);
                    embed.fields[statusIndex].value = `${addPoint} Approved`;
                    const newRow = new ActionRowBuilder().addComponents(
                        approve,
                        reject
                    );

                    await message.edit({
                        embeds: [embed],
                        components: [newRow],
                    });

                    await interaction.editReply(
                        `Successfully gave a point to ${userMention(
                            submitterUser.id
                        )}`
                    );
                } else if (customId === "reject_evidence") {
                    if (
                        rejectButton.disabled ||
                        !submitter.evidence.includes(message.id) ||
                        submitter.points === 0
                    )
                        return await interaction.editReply(
                            "Can't remove a point if the user hasn't been given one from this evidence"
                        ); //disabled / point hasn't been received / user has 0 points

                    submitter.points -= 1;
                    submitter.total_points -= 1;
                    submitter.evidence = submitter.evidence.filter(
                        (mid) => mid !== message.id
                    );

                    await submitter.save();

                    approve.setDisabled(false);
                    reject.setDisabled(true);
                    embed.fields[statusIndex].value = `❗ Awaiting response`;
                    const newRow = new ActionRowBuilder().addComponents(
                        approve,
                        reject
                    );

                    await message.edit({
                        embeds: [embed],
                        components: [newRow],
                    });

                    await interaction.editReply(
                        `Successfully removed a point from ${userMention(
                            submitterUser.id
                        )}`
                    );
                }
            } catch (e) {
                console.error(e);
                await interaction.editReply("There was an error doing that");
            }
        }
    } else if (interaction.isModalSubmit()) {
        let cid = interaction.customId;

        if (cid === "schedule_post") {
            const deadline = interaction.fields.getTextInputValue("deadline");
            const message = interaction.fields.getTextInputValue("message");
            const channelId = interaction.client.schemaPostChannelId;

            const date = interaction.client.parseDate(deadline);

            const currentDate = new Date();
            if (date < currentDate)
                return await interaction.reply("Invalid date");
            const post = new Post({
                message,
                deadline: date,
                channel: channelId,
            });

            await post.save();

            await interaction.reply({
                content: "Post scheduled for " + time(date),
            });
        }
    }
};
