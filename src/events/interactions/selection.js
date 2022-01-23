module.exports = async function selection(client, interaction) {
	if (interaction.customId === 'create-message-channel-selection') {
		let msg = interaction.message.content.split("In welchen Channel möchtest du die Nachricht senden?\n\n")[1];

		const channel = client.channels.cache.get(interaction.values[0]);
		if (channel) {
				await channel.send(msg);
				await interaction.update({ content: `Die Nachricht wurde in den Channel: ${channel.name} geschrieben.`, components: [] });
		}
		else {
			await interaction.update({ content: `Es ist etwas schief gegangen..`, components: [] });

		}
}
}