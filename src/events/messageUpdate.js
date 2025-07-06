module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }
        // Bei Partials nachladen
        if (oldMessage.partial) {
            try { await oldMessage.fetch(); } catch { /* Ignorieren */ }
        }
        if (newMessage.partial) {
            try { await newMessage.fetch(); } catch { /* Ignorieren */ }
        }

        // Nur echte Nutzer-Nachrichten loggen
        if (!newMessage.author || newMessage.author.bot) return;

        // Keine Änderung? (Discord feuert manchmal Events auch ohne echten Text-Change)
        if (
            oldMessage.content === newMessage.content &&
            oldMessage.attachments?.size === newMessage.attachments?.size
        ) {
            return;
        }

        // Logging der Änderung
        const writeLogMessage = require("../utils/writeLogMessage.js");
        await writeLogMessage({
            client: client,
            type: "messageUpdate",
            args: oldMessage,
            newMessage: newMessage
        });
    },
};
