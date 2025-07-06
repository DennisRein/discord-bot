module.exports = {
    name: 'messageDelete',
    async execute(client, message) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }

        // Nichts tun bei fehlender Message, oder wenn der Author ein Bot ist (inkl. System)
        if (!message || message.author?.bot) return;

        const writeLogMessage = require("../utils/writeLogMessage.js");

        // Sicherstellen, dass author, channel und content da sind
        const authorTag = message.author ? `${message.author.tag} (${message.author.id})` : 'Unbekannt';
        const channelId = message.channelId ?? (message.channel ? message.channel.id : 'Unbekannt');
        const content = typeof message.content === 'string' && message.content.trim() !== '' ? message.content : '[Kein Text]';

        writeLogMessage({
            client: client,
            type: "messageDelete",
            args: {
                id: message.id,
                author: authorTag,
                channel: channelId,
                content: content,
                createdAt: message.createdAt
            }
        });
    },
};
