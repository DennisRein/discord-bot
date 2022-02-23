const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeige alle commands an.')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("command")
                .setDescription("Get specific information to one command")
                .setRequired(false)
        }),
	execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
		const data = [];
		const { commands } = interaction.client;

        let embed = new MessageEmbed()
        .setTitle("Eine Liste aller Commands: Nutze /help <command> für eine detaillierte Info.")

        for(let command of commands) {
            embed.addField(command[1].data.name, command[1].data.description)
        }

        interaction.reply({embeds: [embed]})
        
	},
};