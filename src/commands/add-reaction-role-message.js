
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-reaction-role-message')
        .setDescription('Erzeuge eine Nachricht, welche Rollen bei Reaktion verteilt.')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("channel")
                .setDescription("In welchen Kanal möchtest du die Nachricht editieren?")
                .setRequired(true)
                .addChannelType(Constants.ChannelTypes.GUILD_TEXT)
        })
        .addStringOption(option =>
            option.setName("description")
                .setDescription("Der Kurztext, welcher in der Nachricht angezeigt wird")
                .setRequired(false)
        ),
    async execute(interaction) {

        const channelID = interaction.options.get("channel").value;

        const channel = await interaction.client.channels.fetch(channelID);
        let description;
        if(interaction.options.get("description")) {
            description = interaction.options.get("description").value;
        }
        else {
            description = "Keine Beschreibung";
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

        const embed = getEmbed(channel, description);


        await interaction.reply({ content: `Wähle die Rollen, welche durch die Nachricht verteilt werden sollen: ${channel}`, components: [row], embeds: [embed]});

    },
};

function getEmbed(channel, description) {
    return new MessageEmbed()
	.setTitle("Erstelle einen neue Reaction-Rollen")
	.addFields(
		{ name: channel.name, value: channel.id },
		{ name: 'Beschreibung', value: description },
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