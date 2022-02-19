const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageEmbed, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checklist')
        .setDescription('Lass den Bot eine Nachricht senden'),
    async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}

        let embed = new MessageEmbed();
        embed.setTitle("Was du ausprobieren kannst");
        embed.setDescription('Alle Befehle kommen mit multiplen optionalen und benötigten Befehlen, welche die Effekte der Commands beeinflussen.')
        embed.addField('Schau dir alle Befehle an', '/help');
        embed.addField('Sende eine Nachricht über den Bot', '/send-message');
        embed.addField('Editiere Nachrichten vom Bot', '/edit-message');
        embed.addField('Schaue dir die Rollen an die du automatisch bekommst',
                        'Im Voice, in der Faultierhalle, bei Aktivität');
        embed.addField('Erstelle eine Nachricht, welche in einem Intervall gesendet wird', '/add-automatic-message');
        embed.addField('Schau dir alle aktiven automatischen Nachrichten an und bearbeite diese', '/show-automatic-messages, /edit-automatic-message')
        embed.addField('Entferne nicht mehr gebrauchte automatische Nachrichten', '/remove-automatic-message');
        embed.addField('Erstelle eine Reaction-Role Nachricht, mit welcher User eine Rolle bei Reaction bekommen', '/add-reaction-role-message');
        embed.addField('Schreibe dem Bot eine private Nachricht um den Wunschbrunnen zu erkunden', 'Und antworte auf die Nachricht mit dem /reply-to-message Befehl');
        embed.addField('Entferne mehrere Nachrichten gleichzeitig mit dem Purge befehl', '/purge');
        embed.addField('Editiere die verschiedenen Channels für Willkommensnachricht, etc. die Mod Rollen, sowie die Willkommensnachricht', '/setup')

        embed.addField('Versuche auf eine Nachricht mit einem Modemote zu reagieren, ohne eine Mod Rolle zu haben', 'Global Mod, Sektions Mod, etc..')
        interaction.reply({embeds: [embed]});
    },
};