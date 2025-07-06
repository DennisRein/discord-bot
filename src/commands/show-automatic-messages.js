const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-automatic-messages')
        .setDescription('Zeige alle automatischen Nachrichten an!'),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });
            return;
        }
        if (!interaction.client.configExists()) {
            await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });
            return;
        }

        const messageList = await interaction.client.db.autoMessageModel.findAll();
        if (!messageList.length) {
            return interaction.reply({ content: 'Es sind keine automatischen Nachrichten aktiv.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Aktive automatische Nachrichten");

        for (let message of messageList) {
            let msg = message.dataValues;
            let channel = interaction.client.channels.cache.get(msg.channel);
            embed.addFields({
                name: `ID: ${msg.id} | Channel: ${channel ? channel.name : "Unbekannt"} | Intervall: ${msg.interval}`,
                value: msg.message.length > 20 ? msg.message.substring(0, 20) + "..." : msg.message || "Keine Nachricht",
            });
        }

        return interaction.reply({
            content: `Liste der aktiven automatischen Nachrichten:`,
            embeds: [embed],
            ephemeral: true
        });
    },
};
