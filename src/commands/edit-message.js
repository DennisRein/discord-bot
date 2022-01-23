const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-message')
        .setDescription('Edit a message send by the bot')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht editieren?")
                .setRequired(true)  
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

        const message = await channel.messages.fetch(messageID);

        await interaction.reply({ content: `Antworte hierauf mit der neuen Nachricht: \n${message.content}`});

        /**/
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