const {
    SlashCommandBuilder,
    ChannelType,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    BaseSelectMenuBuilder,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionFlagsBits,
} = require("discord.js");

const Post = require("../../models/Post");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Schedule a message")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Channel to send message")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        const modal = new ModalBuilder()
            .setTitle("Schedule message")
            .setCustomId("schedule_post");

        const deadlineInput = new TextInputBuilder()
            .setCustomId("deadline")
            .setPlaceholder("07/01 10pm")
            .setLabel("Use /help for more information")
            .setMinLength(1)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const messageInput = new TextInputBuilder()
            .setCustomId("message")
            .setPlaceholder("Message content here")
            .setLabel("Message to post")
            .setMinLength(1)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        interaction.client.schemaPostChannelId = channel.id;

        const actionRow = new ActionRowBuilder().addComponents(deadlineInput);
        const actionRow2 = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(actionRow2);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    },
};
