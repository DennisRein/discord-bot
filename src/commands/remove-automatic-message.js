const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-automatic-message')
        .setDescription('Entferne eine automatische Nachricht mithilfe der ID.')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setRequired(true)
                .setDescription('Die ID der zu entfernenden Nachricht: /show-automatic-messages')),
    async execute(interaction) {

        let id = interaction.options.get("id").value;

        const rowCount = await interaction.client.db.autoMessageModel.destroy({ where: { id: id } });

        if (!rowCount) return interaction.reply('Diese automatische Nachricht existiert nicht.');

        return interaction.reply('Automatische Nachricht gelöscht.');
    },
};