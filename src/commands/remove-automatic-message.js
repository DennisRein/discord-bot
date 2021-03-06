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
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}

        let id = interaction.options.get("id").value;

        const rowCount = await interaction.client.db.autoMessageModel.destroy({ where: { id: id } });

        if (!rowCount) return interaction.reply('Diese automatische Nachricht existiert nicht.');

        return interaction.reply('Automatische Nachricht gelöscht.');
    },
};