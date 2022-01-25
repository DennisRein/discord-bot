const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-automatic-messages')
        .setDescription('Zeige alle automatischen Nachrichten an!'),
    async execute(interaction) {
        const messageList = await interaction.client.db.autoMessageModel.findAll();
        let embed = new MessageEmbed()
            .setTitle("Sehe hier die aktiven Nachrichten")
        for(let message of messageList) {
            let msg = message.dataValues;       
            let channel = interaction.client.channels.cache.get(msg.channel);
            embed.addField(`ID: ${msg.id} Channel: ${channel.name} Intervall: ${msg.interval}`, msg.message.length > 20 ? msg.message.substring(0, 20) : msg.message )
        }

        return interaction.reply({content: `Liste der aktiven automatischen Nachrichten`, embeds: [embed]});
    },
}; 