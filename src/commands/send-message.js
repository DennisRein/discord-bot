const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-message')
        .setDescription('Lass den Bot eine Nachricht senden')
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht senden?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
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
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: "Bitte wähle einen gültigen Textkanal aus.", ephemeral: true });
        }

        const botMessage = "Antworte bitte auf diese Nachricht mit dem Text, den ich senden soll (1 Minute Zeit):";
        await interaction.reply({ content: botMessage });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60_000, max: 1 });

        collector.on('collect', collected => {
            channel.send(collected.content);
            interaction.followUp({ content: `Nachricht wurde in den Channel **${channel.name}** gesendet.`, ephemeral: true });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.deleteReply();
            }
        });
    },
};
