const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-message')
        .setDescription('Edit a message send by the bot')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht editieren?")
                .setRequired(true)  
                .addChannelType(Constants.ChannelTypes.GUILD_TEXT)
        })
        .addStringOption(option =>
            option.setName("messageid")
                .setDescription("Die ID der zu ändernden Nachricht")
                .setRequired(true)
            ),
    async execute(interaction) {
        let channelID = interaction.options.get("channel").value;

        let messageID = interaction.options.get("messageid").value;

		const channel = await interaction.client.channels.fetch(channelID);
        const msg = await channel.messages.fetch(messageID);

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
                msg.edit(collected.content);
                interaction.followUp(`Nachricht wurde erfolgreich editiert.`);
            })
        });

    },
};

function getChannels(interaction) {
    var array = [];
    let channels = interaction.client.channels;

    for (const channel of channels.cache) {
        let chan = channel[1];
        if(!(chan.type === "GUILD_CATEGORY")) {
            let id = chan.id;
            let name = chan.name;
            let option = {
                label: name,
                description: id,
                value: id
            }
            array.push(option);
        }
    }

    return array;
}