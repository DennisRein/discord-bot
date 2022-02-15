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

		let timed = fields[3].value === "Automatische Entfernung nach" ? null : fields[3].value;
		let description = fields[2].value === "Keine Beschreibung" ? null : fields[2].value;
		let title = fields[1].value === "Keine Überschrifft" ? null : fields[1].value;

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
					let emb = getEmbed(channelObj, description ?? "Keine Beschreibung", map, interaction);
					let buttons = getButtons();
					message.reply({ content: "Passt das so?", embeds: [emb], components: [buttons], fetchReply: true }).then(msg2 => {
						const collector = msg2.channel.createMessageComponentCollector({ time: 15000 });

						collector.on('collect', async i => {
							if (i.customId === 'submit') {
								let e = getChannelMessage(map, interaction, title, description);
								interaction.followUp("Ich sende die Nachricht an den Channel!");
								let send = await channelObj.send({ embeds: [e] });
								let conf;
								for (const [key, value] of Object.entries(map)) {
									send.react(key);
									conf = createConf({ messageId: send.id, reaction: key, roleId: value.id, timed: timed })
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

function isEmoji(str) {
    var ranges = [
        '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])' // U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
        return true;
    } else {
        return false;
    }
}

function getChannelMessage(reactionMap, interaction, title, description) {

	let embed = new MessageEmbed().setTitle(title ?? "Reagiere auf diese Nachricht mit den angezeigten Emotes um die dazugehörige Rolle zu erhalten!");
	embed.setDescription = description ?? "";
	
	for (const [key, value] of Object.entries(reactionMap)) {
		if(isEmoji(key)) {
			embed.addField(value.name, key)
		}
		else {
			const emoji = interaction.guild.emojis.cache.get(key)
			embed.addField(value.name, `<:${emoji.name}:${emoji.id}>`)
		}
	}

	return embed;
}

function getEmbed(channel, description, reactionMap, interaction) {

	let embed = new MessageEmbed()
		.setTitle("Die Beschreibung kannst du Nachträglich mit dem /edit-message Befehl anpassen!")
		.addFields(
			{ name: channel.name, value: channel.id },
			{ name: 'Description', value: description },
		);

	for (const [key, value] of Object.entries(reactionMap)) {
		if(isEmoji(key)) {
			console.log("Is Emoji");
			embed.addField(value.name, key)
		}
		else {
			console.log("Is not Emoji");
			const emoji = interaction.guild.emojis.cache.get(key)
			embed.addField(value.name, `<:${emoji.name}:${emoji.id}>`)
		}
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