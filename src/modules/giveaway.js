const Giveaway = require("../models/Giveaway");
const User = require("../models/User");

const { userMention, EmbedBuilder } = require("discord.js");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = (client) => {
    client.getExpiredGiveaways = () =>
        Giveaway.find({
            deadline: { $lt: new Date() },
            active: true,
        });

    client.processGiveaway = async (giveaway) => {
        const { _id, title, active, deadline, message } = giveaway;

        const guild = await client.guilds.fetch(process.env.ACTIVE_GUILD_ID);
        if (!guild) return;

        const channel = await guild.channels.fetch(
            process.env.GIVEAWAY_CHANNEL
        );
        if (!channel) return;

        const msg = await channel.messages.fetch(message);
        if (!msg) return;

        let entries = [];

        const users = await User.find({
            points: { $gte: 1 },
        });

        for (const user of users) {
            for (let i = 0; i < user.points; i++) {
                entries.push(user);
            }
        }

        shuffleArray(entries);

        let winner = entries[Math.floor(Math.random() * entries.length)];

        //let's update giveaway, set it to inactive and set the winner and post the winner

        try {
            await User.findByIdAndUpdate(winner._id, {
                $set: {
                    points: 0,
                },
            });
            await Giveaway.findByIdAndUpdate(_id, {
                $set: {
                    active: false,
                    winner: winner._id,
                },
            });
        } catch (e) {
            return console.error(e);
        }

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Giveaway")
            .setDescription(
                `**Description**: ${title}\n**Winner**: ${userMention(
                    winner.identifier
                )}`
            );

        msg.edit({
            embeds: [embed],
        });

        return channel.send(
            `<a:giveaway_win:1188809392263544872> Congratulations to ${userMention(
                winner.identifier
            )} for winning the giveaway \`${title}\`!`
        );
    };

    client.giveawayStatus = async (id, active = false) => {
        return Giveaway.findByIdAndUpdate(id, {
            $set: { active },
        });
    };
};
