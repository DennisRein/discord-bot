module.exports = {
	name: 'guildMemberRemove',
	async execute(client, member) {
        const writeLogMessage = require("../utils/writeLogMessage.js");

        const entry = await member.guild.fetchAuditLogs().then(audit => audit.entries.first())

        if(entry.executor.bot) return;

        if(entry.actionType === 'DELETE' && entry.action === 'MEMBER_KICK') {
            writeLogMessage({ client: client, type: "userKicked", args: member, entry })

            return;
        }
        if(entry.actionType === 'DELETE' && entry.action === 'MEMBER_BAN_ADD') {
            writeLogMessage({ client: client, type: "userBanned", args: member, entry })

            return;
        }


        writeLogMessage({ client: client, type: "userLeft", args: member })

    }
        
};
