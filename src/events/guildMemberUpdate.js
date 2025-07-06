module.exports = {
    name: 'guildMemberUpdate',
    async execute(client, oldMember, newMember) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }
        const writeLogMessage = require("../utils/writeLogMessage.js");

        let entry;
        try {
            // Hol die letzten Auditlogs für Member-Updates (type 24)
            const auditLogs = await newMember.guild.fetchAuditLogs({
                limit: 5,
                type: 24 // MEMBER_UPDATE
            });
            entry = auditLogs.entries.find(e =>
                e.target.id === oldMember.id &&
                Date.now() - e.createdTimestamp < 10 * 1000 // Nur sehr frische Auditlogs
            );
        } catch (e) {
            console.warn("Auditlog-Fehler bei guildMemberUpdate:", e);
            return;
        }

        // Timeout gesetzt
        if (
            entry &&
            entry.action === "MEMBER_UPDATE" &&
            entry.changes &&
            entry.changes.some(c => c.key === "communication_disabled_until" && c.new)
        ) {
            writeLogMessage({ client, type: "userTimeouted", args: newMember, entry });
            return;
        }
        // Timeout entfernt
        if (
            entry &&
            entry.action === "MEMBER_UPDATE" &&
            entry.changes &&
            entry.changes.some(c => c.key === "communication_disabled_until" && c.old)
        ) {
            writeLogMessage({ client, type: "userUntimeouted", args: newMember, entry });
            return;
        }

        // Nickname geändert
        if (oldMember.nickname !== newMember.nickname) {
            writeLogMessage({ client, type: "nicknameChanged", args: oldMember, newMember, entry });
            return;
        }

        // Rollen hinzugefügt/entfernt (type 25 in v14+)
        try {
            const auditLogsRole = await newMember.guild.fetchAuditLogs({
                limit: 5,
                type: 25 // MEMBER_ROLE_UPDATE
            });
            const roleEntry = auditLogsRole.entries.find(e =>
                e.target.id === oldMember.id &&
                Date.now() - e.createdTimestamp < 10 * 1000
            );

            if (roleEntry) {
                const changes = roleEntry.changes || [];
                const added = changes.find(c => c.key === "$add");
                const removed = changes.find(c => c.key === "$remove");

                if (added && added.new) {
                    writeLogMessage({ client, type: "roleAdded", args: added.new, member: newMember, entry: roleEntry });
                }
                if (removed && removed.new) {
                    writeLogMessage({ client, type: "roleRemoved", args: removed.new, member: newMember, entry: roleEntry });
                }
            }
        } catch (e) {
            // Wenn Role-Auditlogs fehlschlagen, ignoriere still
        }
    },
};
