const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-automatic-message')
        .setDescription('Lass den Bot eine Nachricht in einem bestimmten Intervall senden!')
        .addChannelOption(channel =>
            channel
                .setName('channel')
                .setDescription('In welchen Kanal möchtest du die Nachricht senden?')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addIntegerOption(option =>
            option
                .setName('interval')
                .setDescription('Alle wieviel Minuten soll die Nachricht gesendet werden?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Der Titel, welcher in der Nachricht angezeigt wird')
                .setRequired(false)
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

        const channel = interaction.options.getChannel('channel');
        const interval = interaction.options.getInteger('interval');
        const title = interaction.options.getString('title') || "";

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
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(collected.content);

            await channel.send({ embeds: [embed] });

            interaction.client.db.autoMessageModel.create({
                message: collected.content,
                title: title,
                channel: channel.id,
                interval: interval,
                lastsend: Date.now(),
            });

            try {
                await interaction.followUp(`Automatische Nachricht wird alle ${interval} Minuten in den Channel ${channel.name} gesendet`);
            } catch (e) {
                // Falls schon geantwortet, nichts tun
            }
        });
    },
};
