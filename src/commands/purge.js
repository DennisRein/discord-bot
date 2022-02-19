const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Entferne eine Anzahl Nachrichten direkt. ')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachrichten entfernen?")
                .setRequired(false)
                .addChannelType(Constants.ChannelTypes.GUILD_TEXT)
        })
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Von welchem User möchtest du die Nachrichten entfernen?')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Anzahl an zu entfernenden Nachrichten. Leer lassen um ALLE betroffenen Nachrichten zu entfernen.')),
    async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}
        const writeLogMessage = require("../utils/writeLogMessage.js");
        const channelID = interaction.options.get("channel") ?? null;
        const userID = interaction.options.get("user") ?? null;

        let amount = interaction.options.get("amount") ?? null;
        let a;
        if (amount) a = amount.value;
        else {
            a = -1;
        }

        let user;
        let channel;

        if (!channelID && !userID) {
            interaction.reply({ content: "Gebe zumindest entweder den User oder den Channel an." })
        }

        if (channelID) {
            channel = await interaction.client.channels.fetch(channelID.value);
        }

        if (userID) {
            user = await interaction.guild.members.cache.get(userID.value);
        }
        let messageIDs = [];

        if (channel && user) {
            let messages = await channel.messages.fetch();

            messages = messages.filter(m => m.author.id === user.id);


            if (a < 0) {
                for (let message of messages) {
                    messageIDs.push(message[0]);
                }
            }
            else {

                let i = 0;
                if (a > messages.size) a = messages.size;
                for (let message of messages) {
                    messageIDs.push(message[0]);
                    i++;
                    if (i == a) break;
                }
            }
        }
        else if (channel) {
            let messages = await interaction.client.messageHelper.fetchChannelMessage(channel);
            if (a < 0) {
                for (let message of messages) {
                    messageIDs.push(message.dataValues.id);
                }
            }
            else {

                let i = 0;
                if (a > messages.size) a = messages.size;
                for (let message of messages) {
                    messageIDs.push(message.dataValues.id);
                    i++;
                    if (i == a) break;
                }
            }
        }
        else if(user) {

            interaction.reply("Nur User wird noch nichts supportet.");
            return;
        }
        let buttons = getButtons();
        interaction.reply({ content: `Sollen wirklich ${messageIDs.length} Nachrichten gelöscht werden?`, components: [buttons], fetchReply: true }).then(msg2 => {
            const collector = msg2.channel.createMessageComponentCollector({ time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'submit') {
                    writeLogMessage({client: interaction.client, type: "purge", args: user, channel, messageIDs, interaction})
                    channel.bulkDelete(messageIDs);
                    await i.update({ content: `Es wurden ${messageIDs.length} Nachrichten gelöscht.`, components: [] });
                        
                }
                if (i.customId === 'abort') {
                    interaction.deleteReply();
                }
            });
        })

    },
};

function getButtons() {
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('submit')
			.setLabel('Passt')
			.setStyle('PRIMARY'),
	)
		.addComponents(
			new MessageButton()
				.setCustomId('abort')
				.setLabel('Abbruch')
				.setStyle('DANGER'),
		);

	return row;
}