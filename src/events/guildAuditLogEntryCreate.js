const { AuditLogEvent } = require("discord.js");
const User = require("../models/User");

module.exports = async (client, auditLog) => {
    const { action, targetId } = auditLog;

    // Check only for kicked users.
    if (action !== AuditLogEvent.MemberKick) return;

    try {
        await User.deleteOne({
            identifier: targetId,
        });

        client.log(`Removed points from ${targetId}`);
    } catch (e) {
        console.error(e);
    }
};
