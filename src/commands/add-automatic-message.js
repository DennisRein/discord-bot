const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

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
                .setDescription('Alle wieviel Minuten soll die Nachricht gesendet werden?')),
    async execute(interaction) {

        let channelID = interaction.options.get("channel").value;
        let interval = interaction.options.get("interval").value;
        const channel = interaction.client.channels.fetch(channelID);

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
                channel.send(collected.content);
                interaction.client.db.autoMessageModel.create({
                    message: collected.content,
                    channel: channelID,
                    interval: interval,
                    lastsend: Date.now(),
                });
            
                return interaction.followUp(`Automatische Nachricht wird alle ${interval} Sekunden in den Channel ${channel.name} gesendet`);
            })
        });




    },
};