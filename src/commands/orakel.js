const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orakel')
        .setDescription('Frage das Orakel')
        .addStringOption(channel => {
            return channel // Add return here
                .setName("frage")
                .setDescription("Auf welche Frage soll der Bot antworten")
                .setRequired(true)
        }),
	async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
		let responses = ["So wie ich es sehe, ja.", "Frag später noch einmal.", "Ich sage es besser nicht jetzt.", "Kann ich jetzt nicht vorhersagen.", "Konzentrier dich und fragen nochmal.",
        "Verlass dich nicht drauf.", "Es ist sicher.", "Es ist eindeutig so.", "Höchstwahrscheinlich.", "Meine Antwort ist nein.", "Meine Quellen sagen nein.",
        "Die Aussichten sind nicht so gut.", "Die Aussichten sind gut.", "Die Antwort ist unklar, versuche es erneut.", "Die Anzeichen deuten auf ein Ja hin.", "Sehr zweifelhaft.", "Ohne Zweifel.",
        "Ja.", "Ja - auf jeden Fall.", "Du kannst dich darauf verlassen."]

        interaction.reply(interaction.options.get("frage").value + "\n\n" + responses[Math.floor(Math.random()*responses.length)])
        
	},
};