const {
    SlashCommandBuilder,
    time,
    EmbedBuilder,
    channelMention,
} = require("discord.js");

const Giveaway = require("../../models/Giveaway");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Setup a giveaway")
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Description of the giveaway")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("date")
                .setDescription("use /help for date formatting")
                .setRequired(true)
        ),
    hasField: {
        key: "role",
        value: "admin",
    },
    defer: {
        ephemeral: true,
    },
    async execute(interaction) {
        const desc = interaction.options.getString("description"),
            d = interaction.options.getString("date");

        const date = interaction.client.parseDate(d);

        if (!date)
            return await interaction.editReply(
                "Invalid date. Use `/help` for help with inputting dates"
            );

        //check if date is in past
        const currentDate = new Date();
        if (date < currentDate)
            return await interaction.editReply(
                "The specified date is in the past."
            );

        //let's create the giveaway message first
        const channel = await interaction.guild.channels.fetch(
            process.env.GIVEAWAY_CHANNEL
        );
        if (!channel)
            return await interaction.editReply(
                "Giveaway channel does not exist"
            );

        const giveaway = new Giveaway({
            active: true,
            deadline: date,
            title: desc,
        });
        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle("Giveaway")
            .setDescription(`**Description**: ${desc}\n**Ends**: ${time(date)}`)
            .setFooter({
                text: `${giveaway._id}`,
            });

        const msg = await channel.send({
            embeds: [embed],
        });

        giveaway.message = msg.id;

        try {
            await giveaway.save();

            await interaction.editReply(
                `Giveaway successfully setup in ${channelMention(channel.id)}`
            );
        } catch (e) {
            console.error(e);

            await msg.delete();
            await interaction.editReply("Error setting up giveaway");
        }
    },
};
