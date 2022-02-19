const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

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
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}

        let userid = interaction.options.get("user").value;

        const user = await interaction.client.users.fetch(userid).catch(console.error);

        
        user.send(interaction.options.get("message").value);

        interaction.reply("Send")
        /*let botMessage = "Antworte bitte auf diese Nachricht mit der Nachricht die du senden willst, du hast eine Minute Zeit: ";
		await interaction.reply({ content: botMessage, fetchReply: true }).then(message => {
  
            const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
            const MESSAGES_TO_COLLECT = 1
            const filter = (m) => m.author.id == interaction.user.id
            const collector = interaction.channel.createMessageCollector({filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT})
            collector.on('end', collected => {
                if (collected.size <= 0) {
                    interaction.deleteReply();
                    
                }
            });
            collector.on('collect', collected => {
                channel.send(collected.content);
                interaction.followUp(`Nachricht wurde in den channel: ${channel.name} gesendet.`);
            })
        });*/




    },
};