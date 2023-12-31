const {
    EmbedBuilder,
    userMention,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const addPoint = "✅";
const removePoint = "❌";

module.exports = async (client, message) => {
    if (message.partial) {
        try {
            await message.fetch();
        } catch (err) {
            console.error(
                "Something went wrong when fetching the message: ",
                err
            );
            return;
        }
    }

    const { author, channel, content, attachments } = message;
    if (author.bot) return; //ignore bot messages
    if (channel.id !== process.env.EVIDENCE_CHANNEL) return; //ignore messages not in evidence channel

    //if no attachments, ignore
    if (!attachments || attachments.size === 0) return;

    //let's upload all the attachments to a web service like imgur
    let imageAttachments = attachments.filter((attachment) => {
        return attachment.contentType.startsWith("image/");
    });
    if (imageAttachments.size === 0) return; //ignore since no attachments are images

    try {
        await message.react("1191040478611767366");

        const { album, images } = await client.uploadToImgurAlbum(
            `Evidence for: @${author.username}`,
            imageAttachments
        );

        //since in guild, we have access to .member
        const member = message.member;

        let fields = [
            {
                name: "Evidence by:",
                value: userMention(author.id),
                inline: true,
            },
            {
                name: "Status:",
                value: "❗ Awaiting response",
                inline: true,
            },
        ];

        if (content) {
            fields = [
                ...fields,
                {
                    name: "Message content:",
                    value: content, //if there's message content, let's append it incase the user has something to say about their submitted evidence
                },
            ];
        }

        if (album) {
            fields = [
                ...fields,
                {
                    name: "Images:",
                    value: `**${attachments.size}** image${
                        attachments.size === 1 ? "" : "s"
                    } attached, view ${
                        attachments.size === 1 ? "it" : "them"
                    } here: <${album}>`,
                },
            ];
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: member.displayName,
                iconURL: member.displayAvatarURL({
                    size: 256,
                }),
            })
            .setColor("#0034ad")
            .addFields(...fields)
            .setImage(images[0])
            .setTimestamp()
            .setFooter({
                text: author.id,
            });

        const approve = new ButtonBuilder()
            .setCustomId("approve_evidence")
            .setLabel("Approve")
            .setStyle(ButtonStyle.Success);
        const reject = new ButtonBuilder()
            .setCustomId("reject_evidence")
            .setLabel("Reject")
            .setDisabled(true)
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(approve, reject);

        const m = await channel.send({ embeds: [embed], components: [row] });

        await message.delete();
    } catch (e) {
        console.error(e);
    }
};
