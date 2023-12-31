const User = require("../models/User");

const addPoint = "✅";
const removePoint = "❌";

module.exports = async (client, reaction, reactor) => {
    return; //legacy code

    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(
                "Something went wrong when fetching the message:",
                error
            );
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    if (!reaction.message.guild) return;

    const {
        emoji,
        message: { channel, guild, id, author },
    } = reaction;

    if (author.bot) return; //ignore bots reactions

    if (channel.id !== process.env.EVIDENCE_CHANNEL) return;

    try {
        const userThatReacted = await User.findOne({
            identifier: reactor.id,
        });
        if (!userThatReacted) return; //since we expect this person to be an admin, we will skip
        if (userThatReacted.role !== "admin") return; //skip if not admin

        let userThatSubmitted = await User.findOne({
            identifier: author.id,
        });

        if (!userThatSubmitted) {
            const guildMember = await guild.members.fetch(author.id);
            //user doesn't exist, let's add them with 0 points
            let newUser = new User({
                identifier: author.id,
                username: author.username,
                displayName: guildMember
                    ? guildMember.displayName
                    : author.displayName,
                avatar: author.displayAvatarURL({
                    size: 256,
                }),
                points: 0,
                total_points: 0,
            });

            await newUser.save();

            userThatSubmitted = newUser;
        }

        // now that we have the user that submitted,
        // we'll check if this message id is already in the evidence list,
        // if so we won't give them a point on "addPoint",
        // but if "removePoint" is reacted, we will -1 to the points and also remove the message id from evidence

        if (emoji.name === addPoint) {
            //add a point to this user
            if (userThatSubmitted.evidence.includes(id)) return; //user already has the point from this message

            userThatSubmitted.points += 1;
            userThatSubmitted.total_points += 1;
            userThatSubmitted.evidence = [...userThatSubmitted.evidence, id];

            await userThatSubmitted.save();
        } else if (emoji.name === removePoint) {
            //remove a point from this user
            if (
                !userThatSubmitted.evidence.includes(id) ||
                userThatSubmitted.points === 0
            )
                return; // user hasn't received a point from this message yet or points are already at 0

            userThatSubmitted.points -= 1;
            userThatSubmitted.total_points -= 1;
            userThatSubmitted.evidence = userThatSubmitted.evidence.filter(
                (mid) => mid !== id
            );

            await userThatSubmitted.save();
        } else return;
    } catch (e) {
        console.error(e);
    }
};
