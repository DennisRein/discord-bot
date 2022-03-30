const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-blocked-phrases')
        .setDescription('Füge der Liste an geblockten Wörtern, neue Wörter hinzu.')
        .addStringOption(option =>
            option.setName("phrases")
                .setDescription("Bei welchen Begriffen, durch ein \";\" getrennt, soll ich Benutzer kicken und die Nachricht löschen?")
                .setRequired(true)
        ),
    async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}
        let phrases = interaction.options.get("phrases").value.split(";");
        
        let combined = interaction.client.phrases.concat(phrases);

        interaction.client.phrases = combined; 
        
        const createConf = require("../utils/createPhrases.js");
        createConf(interaction.client);

        interaction.reply("Ich habe die Liste aktualisiert");




    },
};