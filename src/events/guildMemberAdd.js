module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }

        const { welcomeChannel, ruleChannel, welcomeMessage } = client.config;
        const writeLogMessage = require("../utils/writeLogMessage.js");

        // Channels holen (mit Fehler-Prüfung)
        const channel = client.channels.cache.get(welcomeChannel);
        const channelRule = client.channels.cache.get(ruleChannel);

        writeLogMessage({ client, type: "guildMemberAdd", args: member });

        if (!channel) {
            console.warn("welcomeChannel in der Config ist ungültig oder nicht auf diesem Server.");
            return;
        }

        // Member und Rule als Mentions oder Fallback
        const memberMention = `<@${member.id}>`;
        const ruleMention = channelRule ? `<#${channelRule.id}>` : "#regeln";

        // Platzhalter ersetzen
        let message = (welcomeMessage || "Willkommen {0}! Lies bitte die Regeln in {1}.")
            .replace("{0}", memberMention)
            .replace("{1}", ruleMention);

        await channel.send({ content: message });
    },
};
