module.exports = {
	name: 'guildMemberUpdate',
	async execute(client, oldMember, newMember) {
        const writeLogMessage = require("../utils/writeLogMessage.js");
        if(!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
            return; 
        }
        const entry = await newMember.guild.fetchAuditLogs().then(audit => audit.entries.first())
        if(entry.actionType === 'UPDATE' && entry.changes[0].key === 'communication_disabled_until' && entry.target.id === oldMember.user.id) {
            writeLogMessage({ client: client, type: "userTimeouted", args: newMember, entry })

            return;
        }

        if(oldMember.nickname !== newMember.nickname && entry.changes && entry.changes[0] && entry.changes[0].key === 'nick') return writeLogMessage({client: client, type: "nicknameChanged", args: oldMember, newMember});
        
        if(entry.action === "MEMBER_ROLE_UPDATE")
        {
            if(entry.changes[0].key === "$add") {

                roles = entry.changes[0].new;
                let str = "";
                for(let i in entry.changes[0].new) {
                    str = i.name + " ";
                }
                console.log(entry.changes[0].new);
                writeLogMessage({ client: client, type: "guildMemberUpdate", args: true, roles, newMember });
            }
            if(entry.changes[0].key === "$remove") {
                roles = entry.changes[0].new;
                let str = "";
                for(let i in entry.changes[0].new) {
                    str = i.name + " ";
                }
                console.log(entry.changes[0].new);
                writeLogMessage({ client: client, type: "guildMemberUpdate", args: false, roles, newMember });
            }
        }
        },
};