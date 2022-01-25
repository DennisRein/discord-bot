const { Role, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");


module.exports = async function selection(client, interaction) {
	if (interaction.customId === 'create-role-reaction-message-selection') {
		const createConf = require("../../utils/createReactionConfig.js");
		const { default: ReactionRole } = require("discordjs-reaction-role");

		let msg = interaction.message;
		let embeded = msg.embeds[0];
		let fields = embeded.fields;

		let channel = fields[0].value;
		let channelObj = await interaction.client.channels.fetch(channel);

		let description = fields[1].value === "Keine Beschreibung" ? null : fields[1].value;

		let selectedRoles = interaction.values;

		let embed = new MessageEmbed()
			.setTitle("Die gewählten Rollen:")

		let rolesObject = [];
		let count = 1;
		for (role of selectedRoles) {
			let r = interaction.guild.roles.cache.get(role);
			embed.addField(`Nr. ${count}`, r.name);
			rolesObject.push(r);

			count++;
		}
		let index = 0;
		let map = {};
		await interaction.reply({ content: `Reacte auf diese Nachricht mit den zu den Rollen dazugehörigen Emote in der gegebenen Reihenfolge:`, embeds: [embed], fetchReply: true }).then(message => {
			const filter = (reaction, user) => {
				return user.id === interaction.user.id;
			};
			message.awaitReactions({ filter, max: selectedRoles.length, time: 60000, errors: ['time'] })
				.then(collected => {
					for (let reaction of collected) {
						map[reaction[0]] = rolesObject[index];
						index++;
					}
					let emb = getEmbed(channelObj, description ?? "Keine Beschreibung", map);
					let buttons = getButtons();
					message.reply({ content: "Passt das so?", embeds: [emb], components: [buttons], fetchReply: true }).then(msg2 => {
						const collector = msg2.channel.createMessageComponentCollector({ time: 15000 });

						collector.on('collect', async i => {
							if (i.customId === 'submit') {
								let e = getChannelMessage(map);
								interaction.followUp("Ich sende die Nachricht an den Channel!");
								let send = await channelObj.send({ content: description ?? " ", embeds: [e] });
								let conf;
								for (const [key, value] of Object.entries(map)) {
									send.react(key);
									conf = createConf({ messageId: send.id, reaction: key, roleId: value.id })
								}
								if(client.rr) {
									client.rr.teardown();
								}
								client.rr = new ReactionRole(client, conf);
								await i.update({ content: 'Ich erstelle die Nachricht!', components: [] });
								 
							}
							if (i.customId === 'abort') {
								interaction.message.delete();
								interaction.deleteReply();
								msg2.delete();

							}
						});

						})

				})
				.catch(collected => {
					message.reply('Ein Fehler ist aufgetreten.');
				});
		});
	}
}

function getChannelMessage(reactionMap) {

	let embed = new MessageEmbed().setTitle("Reagiere auf diese Nachricht mit den angezeigten Emotes um die dazugehörige Rolle zu erhalten!");

	for (const [key, value] of Object.entries(reactionMap)) {
		embed.addField(key, value.name)
	}

	return embed;
}

function getEmbed(channel, description, reactionMap) {

	let embed = new MessageEmbed()
		.setTitle("Die Beschreibung kannst du Nachträglich mit dem /edit-message Befehl anpassen!")
		.addFields(
			{ name: channel.name, value: channel.id },
			{ name: 'Description', value: description },
		);

	for (const [key, value] of Object.entries(reactionMap)) {
		embed.addField(key, value.name)
	}

	return embed;
}

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