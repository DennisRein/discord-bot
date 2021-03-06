module.exports = {
	name: 'guildMemberRemove',
	async execute(client, member) {
        if(!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
            return; 
        }
        const writeLogMessage = require("../utils/writeLogMessage.js");

        const entry = await member.guild.fetchAuditLogs().then(audit => audit.entries.first())

        if(entry.actionType === 'DELETE' && entry.action === 'MEMBER_KICK' && !entry.executor.bot ) {
            writeLogMessage({ client: client, type: "userKicked", args: member, entry })

            return;
        }
        else if(entry.actionType === 'DELETE' && entry.action === 'MEMBER_BAN_ADD') {
            writeLogMessage({ client: client, type: "userBanned", args: member, entry })

            return;
        }
        else {
            writeLogMessage({ client: client, type: "userLeft", args: member })
        }

    }
        
};
