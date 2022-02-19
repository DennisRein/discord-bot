const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-automatic-message')
        .setDescription('Lass den Bot eine Nachricht in einem bestimmten Intervall senden!')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht senden?")
                .setRequired(true)
                .addChannelType(Constants.ChannelTypes.GUILD_TEXT)
        })
        .addIntegerOption(option =>
            option
                .setName('interval')
                .setRequired(true)
                .setDescription('Alle wieviel Minuten soll die Nachricht gesendet werden?'))
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Der Titel, welcher in der Nachricht angezeigt wird")
                .setRequired(false)
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
        let channelID = interaction.options.get("channel").value;
        let interval = interaction.options.get("interval").value;
        const channel = await interaction.client.channels.fetch(channelID);

        let title;
        if (interaction.options.get("title")) {
            title = interaction.options.get("title").value;
        }
        else {
            title = "";
        }

        let botMessage = "Antworte bitte auf diese Nachricht mit der Nachricht die du senden willst, du hast eine Minute Zeit: ";
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
                let embed = new MessageEmbed();
                embed.title = title;
                embed.description = collected.content;
                channel.send({embeds: [embed]});
                interaction.client.db.autoMessageModel.create({
                    message: collected.content,
                    title: title,
                    channel: channelID,
                    interval: interval,
                    lastsend: Date.now(),
                });
            
                return interaction.followUp(`Automatische Nachricht wird alle ${interval} Minuten in den Channel ${channel.name} gesendet`);
            })
        });




    },
};