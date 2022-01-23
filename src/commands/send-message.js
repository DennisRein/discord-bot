const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-message')
        .setDescription('Write a message as the bot')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht senden?")
                .setRequired(true)  
        }).addStringOption(option =>
        option.setName("message")
            .setDescription("Die zu sendende Nachricht:")
            .setRequired(true)
        ),
    async execute(interaction) {


        let msg = interaction.options.get("message").value.replaceAll('\\n', '\n');
        let channelID = interaction.options.get("channel").value;

		const channel = interaction.client.channels.cache.get(channelID);
		if (channel) {
				await channel.send(msg);
                await interaction.reply({ content: `Die Nachricht wurde in den Channel: ${channel.name} geschrieben.`});
            }
		else {
            await interaction.reply({ content: `Es ist etwas schief gegangen..`});
		}
    },
};