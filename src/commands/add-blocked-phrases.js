const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-blocked-phrases')
        .setDescription('Füge der Liste an geblockten Wörtern neue Wörter hinzu.')
        .addStringOption(option =>
            option.setName("phrases")
                .setDescription("Begriffe mit \";\" getrennt. Diese Wörter werden geblockt und Nutzer ggf. gekickt.")
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({
                content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.',
                flags: 64 // ephemeral
            });
            return;
        }
        if (!interaction.client.configExists()) {
            await interaction.reply({
                content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!',
                flags: 64 // ephemeral
            });
            return;
        }

        // Neue Phrasen aufsplitten, trimmen, filtern
        let input = interaction.options.getString("phrases");
        let phrases = input
            .split(";")
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Füge sie zur globalen Phrasenliste hinzu, Duplikate raus
        let combined = Array.from(new Set([...(interaction.client.phrases || []), ...phrases]));

        interaction.client.phrases = combined;

        // Schreibe die neue Phrasenliste raus
        const createConf = require("../utils/createPhrases.js");
        createConf(interaction.client);

        await interaction.reply({
            content: `Ich habe die Liste aktualisiert. Aktuelle gesperrte Phrasen: \`${combined.join("; ")}\``,
            flags: 64 // ephemeral
        });
    },
};
