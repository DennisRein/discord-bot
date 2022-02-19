const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Initialisiere den Bot!'),
	async execute(interaction) {
		if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}

        interaction.client.config = {};
        interaction.client.config.guildId = interaction.guild.id;
        interaction.client.config.clientId = interaction.client.id;

        await interaction.reply('Hallo, ich bin Axobotl. Ich stelle dir ein paar Fragen damit ich starten kann!');
        const roles = getRoles(interaction);
        const channels = getChannels(interaction);

        let activityRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('modRole-selection')
                    .setPlaceholder('Mod Rollen?')
                    .addOptions(roles)
                    .setMinValues(1)
            );

        await interaction.followUp({ content: `Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?`, components: [activityRoleRow]});
    },
};

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

function getChannels(interaction) {
    var array = [];
    let channels = interaction.guild.channels;

    for (const channel of channels.cache) {
        let r = channel[1];
        if(r.type !== "GUILD_TEXT") continue;
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