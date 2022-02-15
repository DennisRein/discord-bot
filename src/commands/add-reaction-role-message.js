
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-reaction-role-message')
        .setDescription('Erzeuge eine Nachricht, welche Rollen bei Reaktion verteilt.')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal soll die Nachricht gesendet werden?")
                .setRequired(true)
                .addChannelType(Constants.ChannelTypes.GUILD_TEXT)
        })
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Der Titel, welcher in der Nachricht angezeigt wird")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("Der Kurztext, welcher in der Nachricht angezeigt wird")
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName("timed")
                .setDescription("Nach wievielen Stunden sollen die ausgewählten Rollen entfernt werden? Leer lassen für nie.")
                .setRequired(false)
        ),
    async execute(interaction) {
		if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        const channelID = interaction.options.get("channel").value;

        const channel = await interaction.client.channels.fetch(channelID);
        let description;
        let title;
        let timed;
        if(interaction.options.get("description")) {
            description = interaction.options.get("description").value;
        }
        else {
            description = "Keine Beschreibung";
        }
        if(interaction.options.get("title")) {
            title = interaction.options.get("title").value;
        }
        else {
            title = "Keine Überschrifft";
        }
        if(interaction.options.get("timed")) {
            timed = interaction.options.get("timed").value;
        }
        else {
            timed = -1;
        }

        const roles = getRoles(interaction);
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('create-role-reaction-message-selection')
                    .setPlaceholder('Nothing selected')
                    .setMinValues(1)
                    .addOptions(roles),
            );

        const embed = getEmbed(channel, title, description, timed);


        await interaction.reply({ content: `Wähle die Rollen, welche durch die Nachricht verteilt werden sollen: ${channel}`, components: [row], embeds: [embed]});

    },
};

function getEmbed(channel, title, description, timed) {
    return new MessageEmbed()
	.setTitle("Erstelle einen neue Reaction-Rollen")
	.addFields(
		{ name: channel.name, value: channel.id },
        { name: 'Titel', value: title},
		{ name: 'Beschreibung', value: description },
        { name: 'Automatische Entfernung nach', value: `${timed < 0 ? 'Nie' : timed}` }
	);


}

function getRoles(interaction) {
    var array = [];
    let roles = interaction.guild.roles;

    for (const role of roles.cache) {
        let r = role[1];
        let id = r.id;
        let name = r.name;
        let option = {
            label: name,
            description: id,
            value: id
        }
        array.push(option);
    }

    return array;
}