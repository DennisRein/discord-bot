const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Entferne eine Anzahl Nachrichten direkt.')
        .addChannelOption(channel =>
            channel
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachrichten entfernen?")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Von welchem User möchtest du die Nachrichten entfernen?')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Anzahl an zu entfernenden Nachrichten. Leer lassen um ALLE betroffenen Nachrichten zu entfernen.')
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
        const writeLogMessage = require("../utils/writeLogMessage.js");
        const channel = interaction.options.getChannel("channel") ?? null;
        const user = interaction.options.getUser("user") ?? null;
        let amount = interaction.options.getInteger("amount");
        if (amount === null || amount === undefined) amount = -1;

        if (!channel && !user) {
            await interaction.reply({ content: "Gebe zumindest entweder den User oder den Channel an." });
            return;
        }

        let messageIDs = [];

        if (channel && user) {
            let messages = await channel.messages.fetch();
            messages = messages.filter(m => m.author.id === user.id);

            if (amount < 0) {
                messageIDs = [...messages.keys()];
            } else {
                messageIDs = [...messages.keys()].slice(0, amount);
            }
        }
        else if (channel) {
            let messages = await channel.messages.fetch();

            if (amount < 0) {
                messageIDs = [...messages.keys()];
            } else {
                messageIDs = [...messages.keys()].slice(0, amount);
            }
        }
        else if (user) {
            await interaction.reply("Nur User wird noch nicht supportet.");
            return;
        }

        let buttons = getButtons();
        await interaction.reply({ content: `Sollen wirklich ${messageIDs.length} Nachrichten gelöscht werden?`, components: [buttons], fetchReply: true });

        const msg2 = await interaction.fetchReply();
        const collector = msg2.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'submit') {
                writeLogMessage({ client: interaction.client, type: "purge", args: user, channel, messageIDs, interaction });
                await channel.bulkDelete(messageIDs);
                await i.update({ content: `Es wurden ${messageIDs.length} Nachrichten gelöscht.`, components: [] });
            }
            if (i.customId === 'abort') {
                await interaction.deleteReply();
            }
        });
    },
};

function getButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('submit')
            .setLabel('Passt')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('abort')
            .setLabel('Abbruch')
            .setStyle(ButtonStyle.Danger),
    );
    return row;
}
