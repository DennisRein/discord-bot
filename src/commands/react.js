const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('react')
        .setDescription('Verändere eine zuvor von diesem Bot gesendete Nachricht')
        .addChannelOption(channel =>
            channel
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht editieren?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
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
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });
            return;
        }
        if (!interaction.client.configExists()) {
            await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });
            return;
        }

        const channel = interaction.options.getChannel("channel");
        const messageID = interaction.options.getString("messageid");
        const emote = interaction.options.getString("emote");

        const msg = await interaction.client.messageHelper.fetchMessageById(messageID, channel);

        await msg.react(emote);

        await interaction.reply({ content: "Reaction send" });
    },
};
