const { PermissionsBitField } = require("discord.js");

module.exports = async (client) => {
    client.log("Bot is now ready", "green");
    client.isLoggedIn = true;

    const guild = await client.guilds.fetch(process.env.ACTIVE_GUILD_ID);

    const me = guild.members.me;

    let requiredPermissions = [
        {
            name: "VIEW_AUDIT_LOG",
            bitfield: PermissionsBitField.Flags.ViewAuditLog,
        },
    ];
    let missing = [];
    for (const perm of requiredPermissions) {
        if (!me.permissions.has(perm.bitfield)) {
            missing.push(perm.name);
        }
    }

    if (missing.length) {
        console.log(
            `WARNING: I am missing the following permissions: ${missing.join(
                ", "
            )}`,
            "red"
        );
    } else {
        console.log("I have all required permissions");
    }
};
