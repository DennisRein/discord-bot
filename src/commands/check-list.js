const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checklist')
        .setDescription('Zeig an, was so möglich ist.'),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({
                content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.',
                flags: 64 // Ephemeral
            });
            return;
        }
        if (!interaction.client.configExists()) {
            await interaction.reply({
                content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!',
                flags: 64 // Ephemeral
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Was du ausprobieren kannst")
            .setDescription('Alle Befehle kommen mit multiplen optionalen und benötigten Parametern, welche die Effekte beeinflussen.')
            .addFields(
                { name: 'Schau dir alle Befehle an', value: '/help' },
                { name: 'Sende eine Nachricht über den Bot', value: '/send-message' },
                { name: 'Editiere Nachrichten vom Bot', value: '/edit-message' },
                { name: 'Schaue dir die Rollen an, die du automatisch bekommst', value: 'Im Voice, in der Faultierhalle, bei Aktivität' },
                { name: 'Erstelle eine Nachricht, die im Intervall gesendet wird', value: '/add-automatic-message' },
                { name: 'Bearbeite oder schaue alle aktiven automatischen Nachrichten an', value: '/show-automatic-messages, /edit-automatic-message' },
                { name: 'Entferne nicht mehr gebrauchte automatische Nachrichten', value: '/remove-automatic-message' },
                { name: 'Schreibe dem Bot eine private Nachricht, um den Wunschbrunnen zu erkunden', value: 'Und antworte auf die Nachricht mit /reply-to-message' },
                { name: 'Entferne mehrere Nachrichten gleichzeitig', value: '/purge' },
                { name: 'Editiere die Channels für Willkommensnachricht etc., Mod Rollen und die Willkommensnachricht', value: '/setup' },
                { name: 'Reagiere mit einem Modemote ohne Mod Rolle', value: 'Global Mod, Sektions Mod, etc.' }
            );

        await interaction.reply({ embeds: [embed] });
    },
};
