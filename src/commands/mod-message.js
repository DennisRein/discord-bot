const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod-message')
        .setDescription('Schreibe einem User über den Bot eine private Nachricht')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('An welchen User sende ich die Nachricht?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Welche Nachricht soll ich senden?")
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
                flags: 64
            });
            return;
        }

        const user = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        try {
            await user.send(message);
            await interaction.reply({
                content: "Nachricht erfolgreich gesendet.",
                flags: 64
            });
        } catch (e) {
            await interaction.reply({
                content: "Es gab ein Problem beim Senden – der Benutzer erlaubt wahrscheinlich keine DMs.",
                flags: 64
            });
        }
    },
};
