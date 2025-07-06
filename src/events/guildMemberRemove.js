module.exports = {
    name: 'guildMemberRemove',
    async execute(client, member) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }
        const writeLogMessage = require("../utils/writeLogMessage.js");

        let entry;
        try {
            // Die Typen müssen als Zahlenwerte übergeben werden (discord.js v14+)
            const auditLogs = await member.guild.fetchAuditLogs({
                type: [
                    20, // MEMBER_KICK
                    22  // MEMBER_BAN_ADD
                ],
                limit: 5
            });
            // Finde einen Audit-Log-Eintrag, der zum Member passt und sehr frisch ist
            entry = auditLogs.entries.find(e =>
                e.target.id === member.id &&
                (Date.now() - e.createdTimestamp < 10 * 1000) // max. 10 Sekunden alt
            );
        } catch (e) {
            console.warn("Konnte Audit-Log nicht holen:", e);
            writeLogMessage({ client, type: "userLeft", args: member, note: "Auditlog Error" });
            return;
        }

        if (entry) {
            if (entry.action === 'MEMBER_KICK' && entry.executor && !entry.executor.bot) {
                writeLogMessage({ client, type: "userKicked", args: member, entry });
                return;
            }
            if (entry.action === 'MEMBER_BAN_ADD') {
                writeLogMessage({ client, type: "userBanned", args: member, entry });
                return;
            }
        }

        // Kein Kick/Ban → einfaches Left
        writeLogMessage({ client, type: "userLeft", args: member });
    }
};
