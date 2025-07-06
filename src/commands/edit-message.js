const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-message')
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

        const msg = await interaction.client.messageHelper.fetchMessageById(messageID, channel);

        const botMessage = "Antworte bitte auf diese Nachricht mit der Nachricht, die du senden willst. Du hast eine Minute Zeit:";
        await interaction.reply({ content: botMessage, fetchReply: true });

        const SECONDS_TO_REPLY = 60;
        const MESSAGES_TO_COLLECT = 1;
        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT });

        collector.on('end', async collected => {
            if (collected.size <= 0) {
                try { await interaction.deleteReply(); } catch (e) {}
            }
        });

        collector.on('collect', async collected => {
            await msg.edit(collected.content);
            await interaction.followUp(`Nachricht wurde erfolgreich editiert.`);
        });
    },
};
