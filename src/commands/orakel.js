const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orakel')
        .setDescription('Frage das Orakel')
        .addStringOption(option =>
            option
                .setName("frage")
                .setDescription("Auf welche Frage soll der Bot antworten?")
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

        const responses = [
            "So wie ich es sehe, ja.", "Frag später noch einmal.", "Ich sage es besser nicht jetzt.",
            "Kann ich jetzt nicht vorhersagen.", "Konzentrier dich und frage nochmal.",
            "Verlass dich nicht drauf.", "Es ist sicher.", "Es ist eindeutig so.",
            "Höchstwahrscheinlich.", "Meine Antwort ist nein.", "Meine Quellen sagen nein.",
            "Die Aussichten sind nicht so gut.", "Die Aussichten sind gut.",
            "Die Antwort ist unklar, versuche es erneut.", "Die Anzeichen deuten auf ein Ja hin.",
            "Sehr zweifelhaft.", "Ohne Zweifel.", "Ja.", "Ja - auf jeden Fall.",
            "Du kannst dich darauf verlassen."
        ];

        const frage = interaction.options.getString("frage");
        const antwort = responses[Math.floor(Math.random() * responses.length)];

        await interaction.reply({
            content: `**${frage}**\n\n${antwort}`,
            flags: 64
        });
    },
};
