const Post = require("../models/Post");

module.exports = (client) => {
    client.getExpiredPosts = () =>
        Post.find({
            deadline: { $lt: new Date() },
            active: true,
        });

    client.processPost = async (post) => {
        const { _id, message, deadline, channel: channelId, active } = post;

        console.log(`Processing a post`);

        const guild = await client.guilds.fetch(process.env.ACTIVE_GUILD_ID);
        if (!guild) return;

        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;

        try {
            await Post.findByIdAndUpdate(_id, {
                $set: {
                    active: false,
                },
            });
        } catch (e) {
            return console.error(e);
        }

        return channel.send(message);
    };
};
