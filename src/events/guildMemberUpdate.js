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
        
        let roles = [];
        let added = false;
        if(oldMember.nickname !== newMember.nickname) return writeLogMessage({client: client, type: "nicknameChanged", args: oldMember, newMember});
        
        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            oldMember.roles.cache.forEach(role => {
                if (!newMember.roles.cache.has(role.id)) {
                    roles.push(role);
                }
            });
            writeLogMessage({ client: client, type: "guildMemberUpdate", args: added, roles, newMember });
        } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            added = true;
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id)) {
                    roles.push(role);
                }
            });
            writeLogMessage({ client: client, type: "guildMemberUpdate", args: added, roles, newMember });

        }
        },
};