const { SlashCommandBuilder } = require('@discordjs/builders');
const { Constants } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('react')
        .setDescription('Verändere eine zuvor von diesem Bot gesendete Nachricht')
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
            )            
        .addStringOption(option =>
            option.setName("emote")
                .setDescription("Emote zum Reacten")
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
        let channelID = interaction.options.get("channel").value;

        let messageID = interaction.options.get("messageid").value;

		const channel = await interaction.client.channels.fetch(channelID);
        const msg = await interaction.client.messageHelper.fetchMessageById(messageID, channel);// channel.messages.fetch(messageID);
        
        msg.react(interaction.options.get("emote").value);
        
        await interaction.reply({ content: "Reaction send"})

    },
};