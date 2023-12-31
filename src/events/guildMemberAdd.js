const User = require("../models/User");

//If the user doesn't exist, create them.
module.exports = async (client, guildMember) => {
    try {
        if (guildMember.partial) {
            guildMember = await guildMember.fetch(); //if partial, fetch
        }

        if (guildMember.guild.id !== process.env.ACTIVE_GUILD_ID) return;

        const {
            id,
            user: { username },
        } = guildMember;

        client.log(`${username} has joined ${guildMember.guild.name}`);

        const user = await User.findOne({
            identifier: id,
        });

        if (user) return; //user already exists, skip

        //create new user in database
        const newUser = new User({
            identifier: id,
            username: username,
            avatar: guildMember.user.displayAvatarURL({
                size: 256,
            }),
            points: 0,
        });

        await newUser.save();

        client.log(`Added ${username} to database`);
    } catch (e) {
        //Error with a database call
        console.error(e);
    }
};
